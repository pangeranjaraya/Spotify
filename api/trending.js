export default async function handler(req, res) {
    try {
        const response = await fetch(
            `https://www.jiosaavn.com/api.php?__call=content.getTrending&_format=json&ctx=web6dot0`
        );
        const data = await response.json();
        
        const songs = (data.results || []).map(song => ({
            id: song.id,
            title: song.title,
            artist: song.subtitle || '',
            thumbnail: song.image?.replace('150x150', '500x500') || '',
            source: 'jiosaavn'
        }));
        
        res.json({ results: songs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
