const express = require('express');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const cors = require('cors');
const { TfIdf } = require('natural');
const NodeCache = require('node-cache');
const { v4: uuidv4 } = require('uuid');
const puppeteer = require('puppeteer');

const dbModule = require('./db');
const { generateFlowchartFromPaper } = require('./perplexity');

const app = express();
const port = process.env.PORT || 3001;

// Cache setup (1 hour TTL)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
const parser = new XMLParser();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database connection pool setup
let db;
(async () => {
    db = await dbModule.connectToDB();
})();

async function fetchWithCache(url) {
    const cached = cache.get(url);
    if (cached) return cached;
    
    const response = await axios.get(url, { timeout: 5000 });
    cache.set(url, response.data);
    return response.data;
}

async function fetchPaperDetails(arxivId) {
    const cached = cache.get(`paper-${arxivId}`);
    if (cached) return cached;

    const [dbRes] = await dbModule.searchInDB('papers', { id: arxivId });
    if (dbRes) {
        cache.set(`paper-${arxivId}`, dbRes);
        return dbRes;
    }

    const xmlData = await fetchWithCache(`http://export.arxiv.org/api/query?id_list=${arxivId}`);
    const result = parser.parse(xmlData);
    const entry = result.feed.entry[0];

    const data = {
        id: arxivId,
        title: entry.title[0],
        authors: entry.author.map(a => a.name[0]),
        abstract: entry.summary[0].replace(/\s+/g, ' '),
        link: entry.id[0],
        categories: entry.category.map(c => c.term)
    };

    await db.collection('papers').insertOne(data);
    cache.set(`paper-${arxivId}`, data);
    return data;
}

async function fetchRelatedPapers(category, excludeId, maxResults = 8) {
    const cacheKey = `related-${category}-${maxResults}`;
    const cached = cache.get(cacheKey);
    const xmlData = cached || await fetchWithCache(
        `http://export.arxiv.org/api/query?search_query=cat:${category}&max_results=${maxResults}`
    );

    if (!cached) cache.set(cacheKey, xmlData);
    
    const result = parser.parse(xmlData);
    return result.feed.entry
        .filter(entry => entry.id.split('/abs/')[1] !== excludeId)
        .slice(0, maxResults)
        .map(entry => ({
            id: entry.id.split('/abs/')[1],
            title: entry.title,
            authors: entry.author.map(a => a.name),
            categories: entry.category.map(c => c.term)
        }));
}

async function recursiveSearch(arxivId, depth = 4, maxPapersPerLevel = 8) {
    const visited = new Set();
    const graph = { nodes: [], links: [] };

    async function processLevel(id, currentDepth) {
        if (visited.has(id) || currentDepth > depth) return;
        visited.add(id);

        const paper = await fetchPaperDetails(id);
        graph.nodes.push(paper);

        if (currentDepth < depth) {
            const relatedPapers = await fetchRelatedPapers(paper.categories[0], id, maxPapersPerLevel);
            await Promise.all(relatedPapers.map(async (relatedPaper) => {
                graph.links.push({ source: id, target: relatedPaper.id });
                await processLevel(relatedPaper.id, currentDepth + 1);
            }));
        }
    }

    await processLevel(arxivId, 0);
    return graph;
}

async function suggestCollaborators(paper, relatedPapers) {
    const tfidf = new TfIdf();
    tfidf.addDocument(paper.abstract);
    
    relatedPapers.forEach((rp) => tfidf.addDocument(rp.abstract));
    
    const collaborators = new Map();
    relatedPapers.forEach((rp, i) => {
        const similarity = calculateSimilarity(tfidf, 0, i+1);
        rp.authors.forEach(author => {
            if (!paper.authors.includes(author)) {
                collaborators.set(author, (collaborators.get(author) || 0) + similarity);
            }
        });
    });

    return Array.from(collaborators.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, score]) => ({
            name,
            score: score.toFixed(2),
            reason: `High similarity in research interests`
        }));
}

function calculateSimilarity(tfidf, doc1, doc2) {
    const terms1 = new Set(tfidf.listTerms(doc1).map(t => t.term));
    const terms2 = new Set(tfidf.listTerms(doc2).map(t => t.term));
    return [...terms1].filter(t => terms2.has(t)).length / Math.sqrt(terms1.size * terms2.size);
}

app.get('/api/paper/:id', async (req, res) => {
    try {
        const arxivId = req.params.id;
        const [graph, centralPaper] = await Promise.all([
            recursiveSearch(arxivId),
            fetchPaperDetails(arxivId)
        ]);

        const relatedPapers = graph.nodes.filter(node => node.id !== arxivId);
        const collaboratorSuggestions = await suggestCollaborators(centralPaper, relatedPapers);

        res.json({ ...graph, collaboratorSuggestions });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Processing failed', details: error.message });
    }
});

app.post('/api/generate-flowchart', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: 'No content provided' });

        const flowchartCode = await generateFlowchartFromPaper(content);
        const svgContent = await renderMermaidSVG(flowchartCode);

        res.set('Content-Type', 'image/svg+xml');
        res.send(svgContent);
    } catch (error) {
        console.error('Flowchart error:', error);
        res.status(500).json({ error: 'Flowchart generation failed', details: error.message });
    }
});

async function renderMermaidSVG(mermaidCode) {
    let browser;
    try {
        // Launch a headless browser
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Create an HTML page with the Mermaid flowchart and custom styles
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        /* Custom Mermaid styles */
                        .mermaid {
                            font-family: 'Arial', sans-serif;
                        }

                        .node rect {
                            fill: #E0E7FF; /* Light indigo background */
                            stroke: #4F46E5; /* Indigo border */
                            stroke-width: 2px;
                            border-radius: 8px;
                            transition: all 0.2s ease;
                        }

                        .node rect:hover {
                            fill: #C7D2FE; /* Lighter indigo on hover */
                            stroke-width: 3px;
                        }

                        .edgePath path {
                            stroke: #6B7280; /* Gray stroke */
                            stroke-width: 2px;
                        }

                        .edgePath marker {
                            fill: #6B7280; /* Gray arrowhead */
                        }

                        .label {
                            font-size: 16px;
                            font-weight: 500;
                            color: #1F2937; /* Dark gray text */
                        }

                        .cluster rect {
                            fill: #F3F4F6; /* Light gray background */
                            stroke: #D1D5DB; /* Gray border */
                            stroke-width: 2px;
                            border-radius: 12px;
                        }

                        .cluster text {
                            font-size: 18px;
                            font-weight: 600;
                            color: #374151; /* Darker gray text */
                        }
                    </style>
                </head>
                <body>
                    <div class="mermaid">
                        ${mermaidCode}
                    </div>
                    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
                    <script>
                        // Custom Mermaid configuration
                        mermaid.initialize({
                            startOnLoad: true,
                            theme: 'forest',
                            themeVariables: {
                                primaryColor: '#4F46E5',       // Indigo-600
                                primaryTextColor: '#1F2937',   // Gray-800
                                primaryBorderColor: '#4F46E5', // Indigo-600
                                lineColor: '#6B7280',          // Gray-500
                                fontSize: '20px',
                                nodeBorderRadius: '8px',
                                nodePadding: '30px',
                                mainBkg: '#E0E7FF',            // Indigo-100
                                clusterBkg: '#F3F4F6',         // Gray-100
                                clusterBorder: '#D1D5DB',      // Gray-300
                            },
                            flowchart: {
                                curve: 'basis',
                                htmlLabels: true,
                                useMaxWidth: false,
                                diagramPadding: 50
                            }
                        });
                    </script>
                </body>
            </html>
        `;

        
        // Set the HTML content
        await page.setContent(htmlContent);

        // Wait for the Mermaid diagram to render
        await page.waitForSelector('.mermaid svg');

        // Extract the SVG content
        const svg = await page.$eval('.mermaid svg', (el) => el.outerHTML);

        return svg;
    } catch (error) {
        console.error('Mermaid rendering error:', error);
        throw new Error('Failed to render flowchart');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

app.listen(port, () => {
    console.log(`Optimized server running on port ${port}`);
});