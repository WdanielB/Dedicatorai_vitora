import type { DedicationState } from '../types';
import { BACKGROUND_IMAGE_URL } from '../constants';

// Helper to load an image and handle CORS. It's crucial for drawing cross-origin images to a canvas.
const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; 
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image from src: ${src}`));
        img.src = src;
    });
};

/**
 * Generates an image from the dedication state and triggers a download.
 * @param state The current state of the dedication card.
 */
export const generateImage = async (state: DedicationState): Promise<void> => {
    try {
        // We render to a higher resolution canvas for better quality. The card aspect ratio is 2:3 (for 4x6").
        const canvasWidth = 1200;
        const canvasHeight = 1800;
        
        // This is the reference width used in the Preview component for responsive font scaling.
        // By using the same reference here, we ensure the font size is perfectly proportional.
        const CANONICAL_WIDTH = 400; 
        const scale = canvasWidth / CANONICAL_WIDTH;

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Could not get 2D rendering context from canvas element.');
        }

        // 1. Draw the background image, fitting it to the canvas.
        const bgImage = await loadImage(BACKGROUND_IMAGE_URL);
        ctx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);

        // 2. If a Spotify URI is provided, draw the Spotify code image.
        if (state.spotifyUri && state.spotifyUri.startsWith('spotify:')) {
            const spotifyCodeUrl = `https://scannables.scdn.co/uri/plain/png/FFFFFF/black/640/${state.spotifyUri}`;
            try {
                const spotifyImage = await loadImage(spotifyCodeUrl);
                // Mimic CSS positioning: centered at 25% from the top, horizontal padding 20%.
                const paddingX = canvasWidth * 0.20;
                const spotifyImageWidth = canvasWidth - (2 * paddingX);
                const spotifyImageHeight = spotifyImage.height * (spotifyImageWidth / spotifyImage.width);
                
                const spotifyCenterY = canvasHeight * 0.25; // Center at 25% of the height
                const spotifyDrawY = spotifyCenterY - (spotifyImageHeight / 2); // Adjust for vertical centering

                ctx.drawImage(spotifyImage, paddingX, spotifyDrawY, spotifyImageWidth, spotifyImageHeight);
            } catch (error) {
                console.error("Could not load or draw the Spotify code image. Skipping.", error);
            }
        }
        
        // 3. Set up text rendering properties.
        // The font size is now scaled consistently with the preview component.
        const fontSize = state.fontSize * scale;
        ctx.font = `${fontSize}px ${state.fontFamily}`;
        ctx.fillStyle = 'black';
        ctx.textAlign = state.alignment;
        ctx.textBaseline = 'middle'; // Aligns text vertically relative to the y-coordinate.

        // 4. Calculate text layout with wrapping and newlines.
        const paddingX = canvasWidth * 0.10;
        const textMaxWidth = canvasWidth - (2 * paddingX);
        const allLines: string[] = [];

        const paragraphs = state.text.split('\n');

        for (const paragraph of paragraphs) {
            if (paragraph.trim() === '') {
                allLines.push(''); // Preserve empty lines for multi-paragraph spacing.
                continue;
            }

            const words = paragraph.split(' ');
            let currentLine = '';
            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const metrics = ctx.measureText(testLine);
                if (metrics.width > textMaxWidth && currentLine) {
                    allLines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) {
                allLines.push(currentLine);
            }
        }

        // 5. Draw the laid-out text onto the canvas.
        const lineHeight = fontSize * 1.3;
        const totalTextHeight = allLines.length * lineHeight;
        
        // The y-position from the state defines the vertical center of the text block.
        const blockCenterY = (canvasHeight * state.positionY) / 100;
        const startY = blockCenterY - totalTextHeight / 2;

        let textX: number;
        switch (state.alignment) {
            case 'left':
                textX = paddingX;
                break;
            case 'right':
                textX = canvasWidth - paddingX;
                break;
            default: // center
                textX = canvasWidth / 2;
                break;
        }
        
        for (let i = 0; i < allLines.length; i++) {
            const line = allLines[i];
            const lineY = startY + (i * lineHeight) + (lineHeight / 2); // Center of the line
            ctx.fillText(line, textX, lineY);
        }

        // 6. Convert canvas to an image and trigger download.
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'dedicatoria-personalizada.png';
        link.href = dataUrl;
        document.body.appendChild(link); // Required for Firefox.
        link.click();
        document.body.removeChild(link); // Clean up the DOM.

    } catch (error) {
        console.error('An error occurred while generating the image:', error);
        // Re-throw so it can be handled by the UI and shown to the user.
        throw error;
    }
};