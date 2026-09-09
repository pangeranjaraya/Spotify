export default async function handler(req, res) {
    const { query, page = 1, limit = 30 } = req.query;
    
    if (!query) {
        return res.status(400).json({ error: 'Query required' });
    }
    
    try {
        const response = await fetch(
            `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(query)}&p=${page}&n=${limit}&_format=json&ctx=web6dot0`
        );
        const data = await response.json();
        
        const songs = (data.results || []).map(song => ({
            id: song.id,
            title: song.title,
            artist: song.more_info?.artistMap?.artists?.map(a => a.name).join(', ') || song.subtitle || '',
            album: song.more_info?.album || '',
            duration: song.more_info?.duration || 0,
            thumbnail: song.image?.replace('150x150', '500x500') || '',
            year: song.more_info?.year || '',
            language: song.more_info?.language || '',
            source: 'jiosaavn'
        }));
        
        res.json({ total: songs.length, results: songs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
