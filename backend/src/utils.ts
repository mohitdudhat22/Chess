// Function to get userId from connection URL
export function getUserIdFromConnection(req: any): string | null {
    const params = new URLSearchParams(new URL(req.url, `http://${req.headers.host}`).search);
    return params.get('userId');
}