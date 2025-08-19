import React, { useState } from 'react';
import axios from 'axios';

// type-only imports (required by verbatimModuleSyntax)
import type { ChangeEvent } from 'react';
import type { AxiosProgressEvent } from 'axios';


type Message = {
    text: string;
    type: 'error' | 'success' | '';
};

const Home: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState<Message>({ text: '', type: '' });
    const [fileName, setFileName] = useState('');

    //const API_URL = 'https://mwh3cj2wme.execute-api.eu-north-1.amazonaws.com/prod';
    //arn:aws:execute-api:eu-north-1:017117988836:mwh3cj2wme/*/POST/upload
    const API_URL = 'https://fx2vv0wbnf.execute-api.eu-north-1.amazonaws.com/prod';
    //const API_URL = 'https://fx2vv0wbnf.execute-api.eu-north-1.amazonaws.com/production'

    // Helper function to get token from session storage
    const getTokenFromSessionStorage = (): string | null => {
        try {
            // Look for keys that start with 'oidc.user:'
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith('oidc.user:')) {
                    const userDataStr = sessionStorage.getItem(key);
                    if (userDataStr) {
                        const userData = JSON.parse(userDataStr);
                        // Return the id_token if it exists
                        return userData.id_token || null;
                    }
                }
            }
            return null;
        } catch (error) {
            console.error('Error parsing session storage:', error);
            return null;
        }
    };

    // ✅ typed 'e'
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const validTypes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/csv',
                'application/csv'
            ];

            if (
                validTypes.includes(selectedFile.type) ||
                selectedFile.name.endsWith('.xls') ||
                selectedFile.name.endsWith('.xlsx') ||
                selectedFile.name.endsWith('.csv')
            ) {
                setFile(selectedFile);
                setFileName(selectedFile.name);
                setMessage({ text: '', type: '' });
            } else {
                setMessage({ text: 'Please upload a valid Excel or CSV file', type: 'error' });
                setFile(null);
                setFileName('');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage({ text: 'Please select a file first', type: 'error' });
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setMessage({ text: '', type: '' });

        try {
            // Get token from session storage
            const token = getTokenFromSessionStorage();

            if (!token) {
                setMessage({ text: 'Authentication token not found. Please log in again.', type: 'error' });
                setUploading(false);
                return;
            }

            // Convert file to base64
            const fileBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    // Remove the data:mime/type;base64, prefix
                    const base64 = result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Log the payload size for debugging
            console.log('File size:', file.size, 'bytes');
            console.log('Base64 size:', fileBase64.length, 'characters');
            console.log('File name:', file.name);
            console.log('File type:', file.type);

            // Prepare JSON payload to match Lambda expectation
            const payload = {
                file: fileBase64  // Lambda expects 'file' key with base64 content
            };

            // ✅ removed unused 'response'
            const response = await axios.post(`${API_URL}/upload`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'filename': file.name,           // Lambda reads filename from headers
                    'content-type': file.type        // Lambda reads content-type from headers
                },
                withCredentials: true,
                timeout: 30000, // 30 second timeout for large files
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                }
            });

            console.log('Upload response:', response.data);

            setMessage({ text: 'File uploaded successfully!', type: 'success' });
            setFile(null);
            setFileName('');
        } catch (err: unknown) {
            console.error('Upload error:', err);

            let errorMessage = 'Failed to upload file';
            if (axios.isAxiosError(err)) {
                // Log the full response for debugging
                console.error('Response data:', err.response?.data);
                console.error('Response status:', err.response?.status);
                console.error('Response headers:', err.response?.headers);

                if (err.response?.status === 401) {
                    errorMessage = 'Authentication failed. Please log in again.';
                } else if (err.response?.status === 400) {
                    errorMessage = `Bad request: ${err.response?.data?.error || err.response?.data?.details || 'Invalid request format'}`;
                } else {
                    errorMessage = err.response?.data?.message || err.response?.data?.error || errorMessage;
                }
            }

            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Upload Excel/CSV File to S3</h2>

            <div style={{ margin: '20px 0' }}>
                <input
                    type="file"
                    id="file-upload"
                    accept=".xls,.xlsx,.csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                        style={{
                            padding: '10px 15px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '10px'
                        }}
                    >
                        Choose File
                    </button>
                    <span>{fileName || 'No file chosen'}</span>
                </label>
            </div>

            {file && (
                <div style={{ margin: '20px 0' }}>
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: uploading ? '#cccccc' : '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: uploading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                </div>
            )}

            {uploading && (
                <div style={{ margin: '20px 0', width: '100%' }}>
                    <progress value={uploadProgress} max={100} style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center' }}>{uploadProgress}%</div>
                    </progress>
                </div>
            )}

            {message.text && (
                <div
                    style={{
                        margin: '20px 0',
                        padding: '10px',
                        backgroundColor: message.type === 'error' ? '#ffebee' : '#e8f5e9',
                        color: message.type === 'error' ? '#c62828' : '#2e7d32',
                        borderRadius: '4px',
                        borderLeft: `4px solid ${message.type === 'error' ? '#c62828' : '#2e7d32'}`
                    }}
                >
                    {message.text}
                </div>
            )}

            <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <h3>Instructions:</h3>
                <ul>
                    <li>Only Excel (.xls, .xlsx) and CSV files are accepted</li>
                    <li>Maximum file size: 10MB (adjust as needed)</li>
                    <li>Your file will be uploaded to our secure S3 bucket</li>
                </ul>
            </div>
        </div>
    );
};

export default Home;