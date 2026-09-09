export default async function handler(req, res) {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ error: 'Song ID required' });
    }
    
    try {
        const response = await fetch(
            `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${id}&_format=json&ctx=web6dot0`
        );
        const data = await response.json();
        
        const song = data[id] || {};
        const streamingUrl = song.more_info?.vlink || song.more_info?.media_preview_url || '';
        
        if (!streamingUrl) {
            return res.status(404).json({ error: 'Streaming URL not found' });
        }
        
        res.json({
            id: id,
            title: song.title,
            artist: song.subtitle,
            thumbnail: song.image?.replace('150x150', '500x500') || '',
            streaming_url: streamingUrl,
            duration: song.more_info?.duration || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
