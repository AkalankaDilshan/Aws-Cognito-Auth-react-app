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

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem(
                'CognitoIdentityServiceProvider.7svjd5rvkjtv8ufooqus4o1ml6.c0cc697c-b071-7049-d364-681568476a61.accessToken'
            );

            // OPTIONS request - ignore error
            try {
                await axios.options(`${API_URL}/upload`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                        'Access-Control-Request-Method': 'POST',
                        'Access-Control-Request-Headers': 'Authorization, Content-Type'
                    }
                });
            } catch (optionsError) {
                console.warn('OPTIONS request failed, proceeding anyway', optionsError);
            }

            // ✅ removed unused 'response'
            await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true,
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                }
            });

            setMessage({ text: 'File uploaded successfully!', type: 'success' });
            setFile(null);
            setFileName('');
        } catch (err: unknown) {
            console.error('Upload error:', err);

            let errorMessage = 'Failed to upload file';
            if (axios.isAxiosError(err)) {
                errorMessage = err.response?.data?.message || errorMessage;
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
                    <progress value={uploadProgress} max={100} style={{ width: '100%' }} />
                    <div style={{ textAlign: 'center' }}>{uploadProgress}%</div>
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
