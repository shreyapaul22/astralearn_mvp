import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';

/**
 * Converts a canvas view reference to a base64 image
 * @param {React.RefObject} viewRef - Reference to the canvas view
 * @returns {Promise<string>} - Base64 encoded image
 */
export async function canvasToBase64(viewRef) {
  try {
    console.log('captureRef called with viewRef:', viewRef?.current ? 'valid' : 'invalid');
    
    // Capture the view as an image
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 0.9,
      result: 'base64',
    });

    console.log('Canvas captured successfully, base64 length:', uri?.length);
    
    // The uri is already base64 encoded when result is 'base64'
    return uri;
  } catch (error) {
    console.error('Error converting canvas to image:', error);
    throw new Error('Failed to capture canvas image');
  }
}

