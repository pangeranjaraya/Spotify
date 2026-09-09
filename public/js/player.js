import { db, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from './firebase.js';

let currentSong = null;
let isPlaying = false;
let queue = [];
let currentIndex = -1;
let likedSongs = new Set();

export async function playSong(song, songQueue = []) {
    currentSong = song;
    queue = songQueue;
    currentIndex = songQueue.findIndex(s => s.id === song.id);
    
    const playerBar = document.getElementById('player-bar');
    playerBar.style.display = 'flex';
    
    document.getElementById('player-thumbnail').src = song.thumbnail || '';
    document.getElementById('player-title').textContent = song.title || 'Unknown';
    document.getElementById('player-artist').textContent = song.artist || '';
    
    // Save to Firestore history
    await saveToHistory(song);
    
    // Get stream URL
    try {
        const response = await fetch(`/api/song?id=${song.id}`);
        const data = await response.json();
        
        if (data.streaming_url) {
            document.getElementById('audio-player').src = data.streaming_url;
            document.getElementById('audio-player').play();
            isPlaying = true;
            document.getElementById('btn-play').textContent = '⏸️';
            return;
        }
    } catch (error) {
        console.log('JioSaavn stream failed, trying YouTube...');
    }
    
    // Fallback to YouTube
    try {
        const response = await fetch(`/api/stream?query=${encodeURIComponent(song.title + ' ' + song.artist)}`);
        const data = await response.json();
        
        if (data.streaming_url) {
            document.getElementById('audio-player').src = data.streaming_url;
            document.getElementById('audio-player').play();
            isPlaying = true;
            document.getElementById('btn-play').textContent = '⏸️';
        }
    } catch (error) {
        console.error('Stream failed:', error);
    }
}

export function togglePlay() {
    const audio = document.getElementById('audio-player');
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        document.getElementById('btn-play').textContent = '▶️';
    } else {
        audio.play();
        isPlaying = true;
        document.getElementById('btn-play').textContent = '⏸️';
    }
}

export function nextSong() {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
        playSong(queue[currentIndex + 1], queue);
    }
}

export function prevSong() {
    if (queue.length > 0 && currentIndex > 0) {
        playSong(queue[currentIndex - 1], queue);
    }
}

export function toggleLike() {
    if (!currentSong) return;
    
    if (likedSongs.has(currentSong.id)) {
        likedSongs.delete(currentSong.id);
        document.getElementById('btn-like').textContent = '🤍';
    } else {
        likedSongs.add(currentSong.id);
        document.getElementById('btn-like').textContent = '❤️';
    }
    
    saveLikedSongs();
}

async function saveToHistory(song) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uid) return;
    
    try {
        await addDoc(collection(db, 'users', user.uid, 'history'), {
            song_id: song.id,
            title: song.title,
            artist: song.artist,
            thumbnail: song.thumbnail,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Save history failed:', error);
    }
}

async function saveLikedSongs() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uid) return;
    
    try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            liked_songs: Array.from(likedSongs)
        }, { merge: true });
    } catch (error) {
        console.error('Save liked failed:', error);
    }
}

export async function loadLikedSongs() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uid) return [];
    
    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const data = userDoc.data();
            const liked = data.liked_songs || [];
            likedSongs = new Set(liked);
            return liked;
        }
    } catch (error) {
        console.error('Load liked failed:', error);
    }
    return [];
}

export async function loadHistory() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uid) return [];
    
    try {
        const historyRef = collection(db, 'users', user.uid, 'history');
        const q = query(historyRef);
        const querySnapshot = await getDocs(q);
        
        const history = [];
        querySnapshot.forEach(doc => {
            history.push(doc.data());
        });
        
        return history;
    } catch (error) {
        console.error('Load history failed:', error);
    }
    return [];
}

export function initPlayer() {
    document.getElementById('btn-play').addEventListener('click', togglePlay);
    document.getElementById('btn-next').addEventListener('click', nextSong);
    document.getElementById('btn-prev').addEventListener('click', prevSong);
    document.getElementById('btn-like').addEventListener('click', toggleLike);
    
    loadLikedSongs().then(() => {
        document.getElementById('btn-like').textContent = '🤍';
    });
}
