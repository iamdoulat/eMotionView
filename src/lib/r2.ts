export async function uploadFile(key: string, body: Blob | File, contentType?: string): Promise<string> {
  const formData = new FormData();
  formData.append('key', key);
  formData.append('contentType', contentType || (typeof body === 'string' ? 'text/plain' : 'application/octet-stream'));
  const blob = body instanceof Blob ? body : new Blob([body as BlobPart], { type: contentType });
  formData.append('file', blob);
  const res = await fetch('/api/r2/upload', { method: 'POST', body: formData });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.url;
}

export async function getFileUrl(key: string): Promise<string> {
  const res = await fetch(`/api/r2/url?key=${encodeURIComponent(key)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.url;
}

export async function deleteFile(key: string): Promise<void> {
  const res = await fetch('/api/r2/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}
