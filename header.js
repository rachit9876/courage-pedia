// header.js
// Dynamically injects the site header into the #main-header div

document.addEventListener('DOMContentLoaded', function() {
    const headerHTML = `
    <div class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10 flex items-center justify-between px-2 sm:px-4 py-2">
        <a href="index.html" class="flex-shrink-0">
            <img src="logo.svg" alt="CN Logo" class="h-7 sm:h-8 md:h-10 w-auto" />
        </a>
        <div class="flex-1 max-w-[120px] xs:max-w-xs sm:max-w-sm md:max-w-md mx-1 sm:mx-4">
            <input id="searchInput" type="text" placeholder="Search..." class="w-full px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-gray-400 text-xs sm:text-sm" style="background-color: #333333; color:#9ca3af;">
        </div>
        <div class="flex items-center flex-shrink-0 gap-1 sm:gap-2" style="color:#fdc3ed;">
            <div class="relative">
                <button id="downloadBtn" class="hover:opacity-80 px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-semibold transition-colors">Download</button>
                <div id="downloadDropdown" class="absolute right-0 mt-2 w-44 sm:w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg hidden z-50">
                    <div class="py-1">
                        <a href="researchPaper/ResearchPaper.pdf" download class="block px-3 py-2 text-xs sm:text-sm text-pink-200 hover:bg-gray-700">PDF Format</a>
                        <a href="researchPaper/ResearchPaper.docx" download class="block px-3 py-2 text-xs sm:text-sm text-pink-200 hover:bg-gray-700">DOCX Format</a>
                    </div>
                </div>
            </div>
            <div class="relative">
                <button id="menuBtn" class="focus:outline-none hover:text-gray-300 p-1">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
                <div id="menuDropdown" class="absolute right-0 mt-2 w-44 sm:w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg hidden z-50">
                    <div class="py-1">
                        <a href="index.html" class="nav-item block px-3 py-2 text-xs sm:text-sm text-pink-200 hover:bg-gray-700">Home</a>
                        <a href="stream.html" class="nav-item block px-3 py-2 text-xs sm:text-sm text-pink-200 hover:bg-gray-700">Watch Now</a>
                        <a href="gallery.html" class="nav-item block px-3 py-2 text-xs sm:text-sm text-pink-200 hover:bg-gray-700">Gallery</a>
                        <a href="lostmedia.html" class="nav-item block px-3 py-2 text-xs sm:text-sm text-red-400 hover:bg-gray-700">Lost Media</a>
                        <a href="cookbook/book.html" class="nav-item block px-3 py-2 text-xs sm:text-sm text-pink-200 hover:bg-gray-700">Recipe Book</a>
                        <a href="ost.html" class="nav-item block px-3 py-2 text-xs sm:text-sm text-pink-200 hover:bg-gray-700">O.S.T (Music)</a>
                        <a href="#characters" class="nav-item block px-3 py-2 text-xs sm:text-sm text-pink-200 hover:bg-gray-700">Characters</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    document.getElementById('main-header').innerHTML = headerHTML;

    // Dropdown and search logic (copied from original)
    const menuBtn = document.getElementById('menuBtn');
    const menuDropdown = document.getElementById('menuDropdown');
    menuBtn?.addEventListener('click', () => {
        menuDropdown.classList.toggle('hidden');
    });
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadDropdown = document.getElementById('downloadDropdown');
    downloadBtn?.addEventListener('click', () => {
        downloadDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (menuBtn && !menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
            menuDropdown.classList.add('hidden');
        }
        if (downloadBtn && !downloadBtn.contains(e.target) && !downloadDropdown.contains(e.target)) {
            downloadDropdown.classList.add('hidden');
        }
    });
    // Search bar focus shortcut
    const searchInput = document.getElementById('searchInput');
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput?.focus();
        }
    });
});
