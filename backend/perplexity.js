const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { promisify } = require('util');
const fs = require('fs');
const writeFile = promisify(fs.writeFile);
const NodeCache = require('node-cache');
const path = require('path');

// Cache for storing API responses (5 minutes TTL)
const apiCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Retry mechanism
const retry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay * 2); // Exponential backoff
    }
};

async function generateFlowchartFromPaper(content) {
    const cacheKey = `flowchart-${content.substring(0, 100)}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error("PERPLEXITY_API_KEY environment variable not set");
    }

    const truncatedContent = content.substring(0, 5000); // Limit content to 5000 characters
    const prompt = `Summarize the following academic paper's content and generate a structured outline with main topics and subtopics. Format the outline as a JSON object where keys are main topics and values are arrays of subtopics. Content: ${truncatedContent}`;

    try {
        const response = await retry(() => axios.post(
            'https://api.perplexity.ai/chat/completions',
            {
                model: 'llama-3.1-sonar-large-128k-online',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // Increased timeout
            }
        ));

        console.log('API Response:', response.data); // Log the response
        const responseContent = response.data.choices[0].message.content;
        const outline = extractJSON(responseContent);

        // Validate the outline
        if (!outline || typeof outline !== 'object' || Array.isArray(outline)) {
            throw new Error('Invalid outline format: Expected an object with main topics and subtopics');
        }

        const flowchartCode = generateMermaidFlowchart(outline);
        apiCache.set(cacheKey, flowchartCode);
        return flowchartCode;
    } catch (error) {
        console.error('API Error:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack
        });
        throw new Error('Failed to generate flowchart');
    }
}

function extractJSON(content) {
    try {
        return JSON.parse(content);
    } catch (error) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Invalid JSON format in API response');
    }
}

function generateMermaidFlowchart(outline) {
    let flowchartCode = 'graph TD\nstart[Start]\n';
    
    Object.entries(outline).forEach(([mainTopic, subtopics], index) => {
        // Ensure mainTopic is a string
        const sanitizedMain = sanitizeMermaidText(String(mainTopic));
        const mainNodeId = `main${index}`;
        
        flowchartCode += `${mainNodeId}[${sanitizedMain}]\n`;
        flowchartCode += `start --> ${mainNodeId}\n`;
        
        // Ensure subtopics is an array
        if (!Array.isArray(subtopics)) {
            console.warn(`Subtopics for "${mainTopic}" is not an array. Skipping.`);
            return;
        }

        subtopics.forEach((subtopic, subIndex) => {
            // Ensure subtopic is a string
            const sanitizedSub = sanitizeMermaidText(String(subtopic));
            const subNodeId = `sub${index}_${subIndex}`;
            
            flowchartCode += `${subNodeId}[${sanitizedSub}]\n`;
            flowchartCode += `${mainNodeId} --> ${subNodeId}\n`;
        });
    });
    
    return flowchartCode;
}

function sanitizeMermaidText(text) {
    if (typeof text !== 'string') {
        console.warn(`Expected a string but got ${typeof text}:`, text);
        return '';
    }

    // Remove special characters that might break Mermaid syntax
    return text
        .replace(/[{}[\]()#;]/g, '')
        .replace(/"/g, "'")
        .trim();
}

async function renderMermaidFlowchart(flowchartCode) {
    try {
        // Use dynamic import for ESM modules
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({ startOnLoad: false });
        
        const { svg } = await mermaid.render('flowchart-' + uuidv4(), flowchartCode);
        const filePath = path.join(__dirname, 'flowchart.svg');
        
        await writeFile(filePath, svg);
        return filePath;
    } catch (error) {
        console.error('Mermaid rendering error:', error);
        throw new Error('Failed to render flowchart');
    }
}

module.exports = {
    generateFlowchartFromPaper,
    renderMermaidFlowchart
};