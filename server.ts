import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateImprovedEmail } from './improvedGenerateEmail';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API endpoint to generate email
app.post('/api/generate-email', async (req, res) => {
    try {
        const formData = req.body;
        const email = await generateImprovedEmail(formData, { provider: 'groq' });
        res.json({ email });
    } catch (error) {
        console.error('Error generating email:', error);
        res.status(500).json({ error: error.message || 'Failed to generate email' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
