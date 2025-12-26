// API Base URL
const API_URL = window.location.origin;

// DOM Elements
const downloadForm = document.getElementById('download-form');
const profileForm = document.getElementById('profile-form');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        // Update active states
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${targetTab}-tab`) {
                content.classList.add('active');
            }
        });
    });
});

// Download Video Form
downloadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = document.getElementById('video-url').value.trim();
    const loadingEl = document.getElementById('download-loading');
    const errorEl = document.getElementById('download-error');
    const resultEl = document.getElementById('download-result');

    // Reset states
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    resultEl.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/api/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        loadingEl.classList.add('hidden');

        if (data.success) {
            if (data.type === 'video') {
                // Display video info
                document.getElementById('video-author').textContent = data.author;
                document.getElementById('video-description').textContent = data.description;

                // Display stats
                const statsGrid = document.getElementById('video-stats');
                statsGrid.innerHTML = `
                    <div class="stat-item">
                        <span class="stat-label">❤️ الإعجابات</span>
                        <span class="stat-value">${data.stats.likes}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">💖 المفضلة</span>
                        <span class="stat-value">${data.stats.favorites}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">💬 التعليقات</span>
                        <span class="stat-value">${data.stats.comments}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">👁 المشاهدات</span>
                        <span class="stat-value">${data.stats.views}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">🔄 المشاركات</span>
                        <span class="stat-value">${data.stats.shares}</span>
                    </div>
                `;

                // Automatically trigger download
                const downloadLink = document.createElement('a');
                downloadLink.href = data.videoUrl;
                downloadLink.download = `tiktok_${Date.now()}.mp4`;
                downloadLink.style.display = 'none';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                resultEl.classList.remove('hidden');

                // Update success message
                const resultHeader = resultEl.querySelector('.result-header h3');
                resultHeader.textContent = '✅ جاري تحميل الفيديو إلى جهازك...';

                // Smooth scroll to result
                resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else if (data.type === 'slideshow') {
                errorEl.textContent = '📸 هذا المحتوى عبارة عن صور (slideshow). حالياً نحن ندعم الفيديوهات فقط.';
                errorEl.classList.remove('hidden');
            }
        } else {
            errorEl.textContent = data.message || 'حدث خطأ أثناء التحميل';
            errorEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        loadingEl.classList.add('hidden');
        errorEl.textContent = 'حدث خطأ في الاتصال. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.';
        errorEl.classList.remove('hidden');
    }
});

// Profile Lookup Form
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const loadingEl = document.getElementById('profile-loading');
    const errorEl = document.getElementById('profile-error');
    const resultEl = document.getElementById('profile-result');

    // Reset states
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    resultEl.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/api/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();

        loadingEl.classList.add('hidden');

        if (data.success) {
            const profile = data.profile;

            // Display profile info
            if (profile.avatar) {
                document.getElementById('profile-avatar').src = profile.avatar;
                document.getElementById('profile-avatar').style.display = 'block';
            } else {
                document.getElementById('profile-avatar').style.display = 'none';
            }

            document.getElementById('profile-nickname').textContent = profile.nickname;
            if (profile.verified) {
                document.getElementById('profile-nickname').innerHTML += ' <span style="color: #4facfe;">✓</span>';
            }

            document.getElementById('profile-username').textContent = profile.username;
            document.getElementById('profile-bio').textContent = profile.bio;

            // Add region if available
            const profileInfo = document.querySelector('.profile-info');
            const existingRegion = profileInfo.querySelector('.profile-region');
            if (existingRegion) existingRegion.remove();

            if (profile.region) {
                const regionEl = document.createElement('p');
                regionEl.className = 'profile-region';
                regionEl.style.cssText = 'color: var(--accent); font-weight: 500; margin-top: 0.5rem;';
                regionEl.innerHTML = `🌍 ${profile.region}`;
                profileInfo.appendChild(regionEl);
            }

            // Display stats
            const statsGrid = document.getElementById('profile-stats');
            statsGrid.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">👥 المتابعين</span>
                    <span class="stat-value">${profile.stats.followers}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">⭐ يتابع</span>
                    <span class="stat-value">${profile.stats.following}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">❤️ الإعجابات</span>
                    <span class="stat-value">${profile.stats.likes}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">🎬 الفيديوهات</span>
                    <span class="stat-value">${profile.stats.videos}</span>
                </div>
            `;

            resultEl.classList.remove('hidden');

            // Smooth scroll to result
            resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            errorEl.textContent = data.message || 'حدث خطأ أثناء البحث';
            errorEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        loadingEl.classList.add('hidden');
        errorEl.textContent = 'حدث خطأ في الاتصال. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.';
        errorEl.classList.remove('hidden');
    }
});

// Profile Editor - Session Management
let currentSession = null;
let userCookies = [];

const sessionForm = document.getElementById('session-form');
const nicknameForm = document.getElementById('nickname-form');
const avatarForm = document.getElementById('avatar-form');
const bioForm = document.getElementById('bio-form');
const logoutBtn = document.getElementById('logout-btn');

// Helper function to parse cookies
function parseCookies(cookieString) {
    const cookies = [];
    const pairs = cookieString.split(';');

    for (const pair of pairs) {
        const [name, value] = pair.trim().split('=');
        if (name && value) {
            cookies.push({
                name: name.trim(),
                value: value.trim(),
                domain: '.tiktok.com',
                path: '/'
            });
        }
    }

    return cookies;
}

// Session Login
sessionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const sessionId = document.getElementById('session-id').value.trim();
    const cookieString = document.getElementById('session-cookies').value.trim();
    const loadingEl = document.getElementById('session-loading');
    const errorEl = document.getElementById('session-error');
    const loginSection = document.getElementById('session-login-section');
    const editorSection = document.getElementById('editor-section');

    // Reset states
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');

    try {
        // Parse cookies
        userCookies = parseCookies(cookieString);

        if (userCookies.length === 0) {
            loadingEl.classList.add('hidden');
            errorEl.textContent = 'الرجاء إدخال cookies صحيحة';
            errorEl.classList.remove('hidden');
            return;
        }

        const response = await fetch(`${API_URL}/api/verify-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
        });

        const data = await response.json();

        loadingEl.classList.add('hidden');

        if (data.success) {
            currentSession = {
                sessionId: sessionId,
                profile: data.profile,
                cookies: userCookies
            };

            // Display profile
            document.getElementById('editor-avatar').src = data.profile.avatar || '';
            document.getElementById('editor-nickname').textContent = data.profile.nickname;
            document.getElementById('editor-username').textContent = data.profile.username;
            document.getElementById('editor-bio').textContent = data.profile.bio || 'لا يوجد';

            // Show editor section
            loginSection.classList.add('hidden');
            editorSection.classList.remove('hidden');
        } else {
            errorEl.textContent = data.message || 'فشل التحقق من الجلسة';
            errorEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        loadingEl.classList.add('hidden');
        errorEl.textContent = 'حدث خطأ في الاتصال. حاول مرة أخرى.';
        errorEl.classList.remove('hidden');
    }
});

// Update Nickname
nicknameForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentSession) return;

    const newNickname = document.getElementById('new-nickname').value.trim();
    const statusEl = document.getElementById('nickname-status');

    statusEl.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/api/update-nickname`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: currentSession.sessionId,
                nickname: newNickname,
                cookies: currentSession.cookies
            })
        });

        const data = await response.json();

        if (data.success) {
            statusEl.textContent = '✅ تم تحديث الاسم بنجاح في تيك توك!';
            statusEl.className = 'status-message success';
            statusEl.classList.remove('hidden');

            // Update display
            document.getElementById('editor-nickname').textContent = newNickname;
            currentSession.profile.nickname = newNickname;

            // Clear input
            document.getElementById('new-nickname').value = '';
        } else {
            statusEl.textContent = data.message || 'فشل تحديث الاسم';
            statusEl.className = 'status-message error';
            statusEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        statusEl.textContent = 'حدث خطأ في الاتصال';
        statusEl.className = 'status-message error';
        statusEl.classList.remove('hidden');
    }
});

// Update Avatar
avatarForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentSession) return;

    const newAvatar = document.getElementById('new-avatar').value.trim();
    const statusEl = document.getElementById('avatar-status');

    statusEl.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/api/update-avatar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: currentSession.sessionId,
                avatar: newAvatar
            })
        });

        const data = await response.json();

        if (data.success) {
            statusEl.textContent = '✅ تم تحديث الصورة بنجاح!';
            statusEl.className = 'status-message success';
            statusEl.classList.remove('hidden');

            // Update display
            document.getElementById('editor-avatar').src = newAvatar;
            currentSession.profile.avatar = newAvatar;

            // Clear input
            document.getElementById('new-avatar').value = '';
        } else {
            statusEl.textContent = data.message || 'فشل تحديث الصورة';
            statusEl.className = 'status-message error';
            statusEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        statusEl.textContent = 'حدث خطأ في الاتصال';
        statusEl.className = 'status-message error';
        statusEl.classList.remove('hidden');
    }
});

// Update Bio
bioForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentSession) return;

    const newBio = document.getElementById('new-bio').value.trim();
    const statusEl = document.getElementById('bio-status');

    statusEl.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/api/update-bio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: currentSession.sessionId,
                bio: newBio,
                cookies: currentSession.cookies
            })
        });

        const data = await response.json();

        if (data.success) {
            statusEl.textContent = '✅ تم تحديث البايو بنجاح في تيك توك!';
            statusEl.className = 'status-message success';
            statusEl.classList.remove('hidden');

            // Update display
            document.getElementById('editor-bio').textContent = newBio;
            currentSession.profile.bio = newBio;

            // Clear input
            document.getElementById('new-bio').value = '';
        } else {
            statusEl.textContent = data.message || 'فشل تحديث البايو';
            statusEl.className = 'status-message error';
            statusEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        statusEl.textContent = 'حدث خطأ في الاتصال';
        statusEl.className = 'status-message error';
        statusEl.classList.remove('hidden');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    currentSession = null;

    // Reset forms
    document.getElementById('session-id').value = '';
    document.getElementById('new-nickname').value = '';
    document.getElementById('new-avatar').value = '';
    document.getElementById('new-bio').value = '';

    // Hide status messages
    document.getElementById('nickname-status').classList.add('hidden');
    document.getElementById('avatar-status').classList.add('hidden');
    document.getElementById('bio-status').classList.add('hidden');

    // Show login section
    document.getElementById('session-login-section').classList.remove('hidden');
    document.getElementById('editor-section').classList.add('hidden');
});

// Add smooth animations on page load
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Add input validation feedback
const inputs = document.querySelectorAll('.input-field');
inputs.forEach(input => {
    input.addEventListener('input', () => {
        if (input.value.trim()) {
            input.style.borderColor = 'var(--accent)';
        } else {
            input.style.borderColor = 'var(--border)';
        }
    });
});
