# Spyder 

## Inspiration
In the rapidly evolving world of academic research, staying updated with the latest papers and identifying trends is crucial. However, the process of finding connections between new research and older foundational work can be overwhelming. As computer science students passionate about advancing research accessibility, we wanted to simplify this. Spyder was born out of a need to streamline the research process by offering a visualization tool that shows the intricate web of citations and potential collaborators, enabling researchers to see the ripple effects of any single paper and easily explore its impact.

We were also motivated by the idea of making research accessible to people from all backgrounds, particularly those who may not have a computer science background but are looking to break down dense academic content in ways that are clear and actionable.

## Who We Are
- Philo Gabra (https://github.com/phgabra)
- Pacis Nkubito (https://github.com/N-pacis)
- Alp Niksarli (https://github.com/alpnix)
- Murtaza Kalāgh (https://github.com/MurtazaKafka)

## What it does
Spyder allows users to input an arXiv article ID and instantly generates:

- A network visualization showing further work that has built upon the original article.
- A display of primary information such as the paper’s title, authors, abstract, and a breakdown of key ideas.
- A flowchart visualization of the core concepts, providing a simplified overview of the paper’s content.
- A feature for identifying potential collaborators by analyzing research methodologies and interests from the paper.

Additionally, Spyder lets users upload images of physical research papers. Through optical character recognition (OCR) technology, it converts these documents into a series of visuals and a summarized, interpretable format. Our tool utilizes Perplexity’s AI to assist in summarizing the complex language of research papers, making them more digestible for a wider audience.


## How we built it
Spyder was developed using a robust tech stack:

- **Backend:** Python, FastAPI, Node.js, Express, MongoDB, and Defang for secure backend functionality and database management.
- **Frontend:** React.js and TailwindCSS for a sleek, user-friendly interface.
- **APIs and integrations:** We employed the Perplexity API to leverage natural language processing and Tesseract for OCR capabilities.
- **Deployment:** The platform is hosted on Vercel, while we used Terraform for cloud infrastructure management.
- **Domain:** GoDaddy serves as our domain provider, ensuring that our platform is easily accessible.

Each of these technologies was carefully selected to optimize performance, scalability, and ease of use.


## Challenges we ran into
One of the biggest challenges was integrating Tesseract's OCR with Perplexity's language processing in a way that provides seamless, accurate summaries. We also ran into some difficulties when handling large citation networks, especially when visualizing papers with hundreds of references. Striking a balance between creating an intuitive user experience and maintaining the technical depth of the tool was also challenging, but we’re proud of where we landed.

Another challenge was ensuring accessibility for users unfamiliar with technical research terms, which required multiple iterations of UI/UX design.


## Accomplishments that we're proud of
- Successfully implementing a network visualization of citation data that helps users instantly understand the scope of a paper’s impact.
- The OCR and language integration, allowing physical papers to be easily converted and understood digitally.
- Creating a platform that democratizes research by being accessible to a broader audience, regardless of their technical background.


## What we learned
We deepened our understanding of how to create tools that balance technical sophistication with accessibility. From integrating complex technologies like OCR and NLP, to ensuring that our platform can scale for large datasets, every step was a learning experience. Collaboration was key, and we honed our ability to communicate effectively across team members with diverse skill sets.


## What's next for Spyder
Our next steps are to:

- Expand the network visualization capabilities to include cross-referencing from other research databases.
- Improve the collaborative feature, adding a recommendation system to suggest not just collaborators but related research areas based on user input.
- Develop a mobile-friendly version of Spyder.
- Continue refining our OCR process to make it more adaptable to non-standard formats.
