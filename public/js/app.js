import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, googleProvider, signOut, onAuthStateChanged } from './firebase.js';
import { initTheme, applyTheme } from './theme.js';
import { initPlayer, playSong, loadHistory, loadLikedSongs } from './player.js';

let currentUser = null;
let currentPage = 'home';
let trendingSongs = [];
let searchResults = [];

// ========== AUTH ==========

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            avatar: user.photoURL || ''
        }));
        
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        
        document.getElementById('user-avatar').src = user.photoURL || '';
        document.getElementById('user-name').textContent = user.displayName || user.email.split('@')[0];
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('hero-name').textContent = user.displayName || user.email.split('@')[0];
        
        loadTrending();
        loadHistoryPage();
        loadLikedPage();
    } else {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }
});

document.getElementById('btn-google').addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        alert('Login Google gagal: ' + error.message);
    }
});

document.getElementById('btn-email').addEventListener('click', () => {
    const email = prompt('Email:');
    const password = prompt('Password:');
    if (email && password) {
        signInWithEmailAndPassword(auth, email, password)
            .catch(error => alert('Login gagal: ' + error.message));
    }
});

document.getElementById('btn-register').addEventListener('click', () => {
    const email = prompt('Email:');
    const password = prompt('Password (min 6 karakter):');
    if (email && password) {
        createUserWithEmailAndPassword(auth, email, password)
            .catch(error => alert('Register gagal: ' + error.message));
    }
});

document.getElementById('btn-logout').addEventListener('click', async () => {
    await signOut(auth);
    localStorage.removeItem('user');
});

// ========== NAVIGATION ==========

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        switchPage(page);
    });
});

function switchPage(page) {
    currentPage = page;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) item.classList.add('active');
    });
    
    document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
    });
    
    document.getElementById('page-' + page).style.display = 'block';
    document.getElementById('page-title').textContent = page.charAt(0).toUpperCase() + page.slice(1);
    
    if (page === 'trending') loadTrending();
    if (page === 'history') loadHistoryPage();
    if (page === 'liked') loadLikedPage();
}

// ========== MENU TOGGLE ==========

document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

// ========== SEARCH ==========

async function searchMusic() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;
    
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '<p>Searching...</p>';
    
    try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        searchResults = data.results || [];
        displaySongList(searchResults, 'search-results');
    } catch (error) {
        resultsContainer.innerHTML = '<p>Error: ' + error.message + '</p>';
    }
}

// ========== TRENDING ==========

async function loadTrending() {
    const trendingContainer = document.getElementById('trending-songs');
    const recommendedContainer = document.getElementById('recommended-songs');
    
    if (!trendingSongs.length) {
        trendingContainer.innerHTML = '<p>Loading...</p>';
        
        try {
            const response = await fetch('/api/trending');
            const data = await response.json();
            trendingSongs = data.results || [];
        } catch (error) {
            trendingContainer.innerHTML = '<p>Error: ' + error.message + '</p>';
            return;
        }
    }
    
    displaySongGrid(trendingSongs, 'trending-songs');
    displaySongGrid(trendingSongs.slice(0, 12), 'recommended-songs');
}

// ========== HISTORY ==========

async function loadHistoryPage() {
    const historyContainer = document.getElementById('history-songs');
    const history = await loadHistory();
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p>Belum ada history.</p>';
        return;
    }
    
    displaySongList(history, 'history-songs');
}

// ========== LIKED ==========

async function loadLikedPage() {
    const likedContainer = document.getElementById('liked-songs');
    const liked = await loadLikedSongs();
    
    if (liked.length === 0) {
        likedContainer.innerHTML = '<p>Belum ada lagu yang disukai.</p>';
        return;
    }
    
    const likedSongsData = liked.map(id => ({ id, title: 'Song ' + id, artist: '', thumbnail: '' }));
    displaySongList(likedSongsData, 'liked-songs');
}

// ========== DISPLAY HELPERS ==========

function displaySongGrid(songs, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <img src="${song.thumbnail || ''}" alt="" onerror="this.style.display='none'">
            <h4>${song.title || 'Unknown'}</h4>
            <p>${song.artist || ''}</p>
        `;
        card.onclick = () => playSong(song, songs);
        container.appendChild(card);
    });
}

function displaySongList(songs, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    songs.forEach(song => {
        const item = document.createElement('div');
        item.className = 'song-list-item';
        item.innerHTML = `
            <img src="${song.thumbnail || ''}" alt="" onerror="this.style.display='none'">
            <div class="song-info">
                <h4>${song.title || 'Unknown'}</h4>
                <p>${song.artist || ''}</p>
            </div>
        `;
        item.onclick = () => playSong(song, songs);
        container.appendChild(item);
    });
}

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initPlayer();
    loadTrending();
    
    // Expose search to global
    window.searchMusic = searchMusic;
});
