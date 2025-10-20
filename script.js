


// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Application State
const state = {
    allResults: [],
    filteredResults: [],
    textAreaCount: 1,
    currentPage: 1,
    resultsPerPage: 5,
    MAX_RESULTS: 200
};

// DOM Elements
const elements = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    updateUI();
});

// Initialize DOM Elements
function initializeElements() {
    // Navigation
    elements.dynamicIsland = document.querySelector('.dynamic-island');
    elements.exportIsland = document.getElementById('exportIsland');
    elements.settingsIsland = document.getElementById('settingsIsland');
    
    // Sidebar
    elements.navItems = document.querySelectorAll('.nav-item');
    elements.resultsCount = document.getElementById('resultsCount');
    elements.processedCount = document.getElementById('processedCount');
    elements.successCount = document.getElementById('successCount');
    elements.failedCount = document.getElementById('failedCount');
    
    // Input Tab
    elements.textInputs = document.getElementById('textInputs');
    elements.parseButton = document.getElementById('parseButton');
    elements.clearAll = document.getElementById('clearAll');
    elements.fileInput = document.getElementById('fileInput');
    elements.browseButton = document.getElementById('browseButton');
    elements.uploadArea = document.getElementById('uploadArea');
    elements.fileInfo = document.getElementById('fileInfo');
    elements.addTextArea = document.getElementById('addTextArea');
    elements.textCount = document.getElementById('textCount');
    
    // Results Tab
    elements.searchInput = document.getElementById('searchInput');
    elements.sgpaFilter = document.getElementById('sgpaFilter');
    elements.branchFilter = document.getElementById('branchFilter');
    elements.sortOrder = document.getElementById('sortOrder');
    elements.resultsContainer = document.getElementById('resultsContainer');
    elements.prevPage = document.getElementById('prevPage');
    elements.nextPage = document.getElementById('nextPage');
    elements.pageInfo = document.getElementById('pageInfo');
    
    // Analytics Tab
    elements.avgSgpa = document.getElementById('avgSgpa');
    elements.totalStudents = document.getElementById('totalStudents');
    elements.avgCredits = document.getElementById('avgCredits');
    elements.failedSubjects = document.getElementById('failedSubjects');
    
    // Performance Distribution
    elements.excellentCount = document.getElementById('excellentCount');
    elements.excellentPercent = document.getElementById('excellentPercent');
    elements.veryGoodCount = document.getElementById('veryGoodCount');
    elements.veryGoodPercent = document.getElementById('veryGoodPercent');
    elements.goodCount = document.getElementById('goodCount');
    elements.goodPercent = document.getElementById('goodPercent');
    elements.averageCount = document.getElementById('averageCount');
    elements.averagePercent = document.getElementById('averagePercent');
    elements.needsImprovementCount = document.getElementById('needsImprovementCount');
    elements.needsImprovementPercent = document.getElementById('needsImprovementPercent');
    elements.failedCountAnalytics = document.getElementById('failedCount');
    elements.failedPercent = document.getElementById('failedPercent');
    
    // Performance Charts
    elements.sgpaChart = document.getElementById('sgpaChart');
    elements.highestSgpa = document.getElementById('highestSgpa');
    elements.lowestSgpa = document.getElementById('lowestSgpa');
    elements.passPercentage = document.getElementById('passPercentage');
    elements.topperCount = document.getElementById('topperCount');
    
    
    // Export Tab
    elements.exportCSV = document.getElementById('exportCSV');
    elements.exportJSON = document.getElementById('exportJSON');
    elements.exportPDF = document.getElementById('exportPDF');
    
    // Progress
    elements.progressOverlay = document.getElementById('progressOverlay');
    elements.progressText = document.getElementById('progressText');
    elements.progressFill = document.getElementById('progressFill');
    
    // Tab Contents
    elements.tabContents = document.querySelectorAll('.tab-content');
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(item.dataset.tab);
        });
    });
    
    // Dynamic Island
    elements.exportIsland.addEventListener('click', exportToCSV);
    
    // Input Methods
    elements.browseButton.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelection);
    setupDragAndDrop();
    elements.addTextArea.addEventListener('click', addNewTextArea);
    elements.parseButton.addEventListener('click', parseAllResults);
    elements.clearAll.addEventListener('click', resetApplication);
    
    // Results Management
    elements.searchInput.addEventListener('input', applyFilters);
    elements.sgpaFilter.addEventListener('change', applyFilters);
    elements.branchFilter.addEventListener('change', applyFilters);
    elements.sortOrder.addEventListener('change', applyFilters);
    elements.prevPage.addEventListener('click', goToPreviousPage);
    elements.nextPage.addEventListener('click', goToNextPage);
    
    // Export
    elements.exportCSV.addEventListener('click', exportToCSV);
    elements.exportJSON.addEventListener('click', exportToJSON);
    elements.exportPDF.addEventListener('click', exportToPDF);
}

// Tab Navigation
function switchTab(tabName) {
    // Update active nav item
    elements.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        }
    });
    
    // Show active tab content
    elements.tabContents.forEach(tab => {
        tab.classList.remove('active');
        if (tab.id === `${tabName}-tab`) {
            tab.classList.add('active');
        }
    });
    
    // Update dynamic island
    updateDynamicIsland(tabName);
    
    // If switching to analytics tab, update charts
    if (tabName === 'analytics') {
        updateAnalyticsCharts();
    }
}

function updateDynamicIsland(tab) {
    const islandTitle = elements.dynamicIsland.querySelector('.island-title');
    const islandSubtitle = elements.dynamicIsland.querySelector('.island-subtitle');
    
    switch(tab) {
        case 'input':
            islandTitle.textContent = 'Input Methods';
            islandSubtitle.textContent = 'Upload or paste results';
            break;
        case 'results':
            islandTitle.textContent = 'Results View';
            islandSubtitle.textContent = `${state.filteredResults.length} students`;
            break;
        case 'analytics':
            islandTitle.textContent = 'Analytics';
            islandSubtitle.textContent = 'Performance insights';
            break;
        case 'export':
            islandTitle.textContent = 'Export Data';
            islandSubtitle.textContent = 'Download in various formats';
            break;
    }
}

// File Handling
function setupDragAndDrop() {
    elements.uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        elements.uploadArea.style.borderColor = 'var(--primary)';
        elements.uploadArea.style.background = 'rgba(0, 122, 255, 0.05)';
    });
    
    elements.uploadArea.addEventListener('dragleave', function() {
        elements.uploadArea.style.borderColor = 'rgba(0, 122, 255, 0.3)';
        elements.uploadArea.style.background = 'transparent';
    });
    
    elements.uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        elements.uploadArea.style.borderColor = 'rgba(0, 122, 255, 0.3)';
        elements.uploadArea.style.background = 'transparent';
        
        if (e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files)
                .filter(file => file.type === 'application/pdf')
                .slice(0, state.MAX_RESULTS);
            
            if (files.length > 0) {
                elements.fileInfo.textContent = `Selected: ${files.length} file(s)`;
                processPDFFiles(files);
            }
        }
    });
}

function handleFileSelection(e) {
    if (e.target.files.length > 0) {
        const files = Array.from(e.target.files).slice(0, state.MAX_RESULTS);
        elements.fileInfo.textContent = `Selected: ${files.length} file(s)`;
        processPDFFiles(files);
    }
}

// Text Area Management
function addNewTextArea() {
    if (state.textAreaCount < state.MAX_RESULTS) {
        const newTextArea = document.createElement('textarea');
        newTextArea.className = 'result-text';
        newTextArea.placeholder = 'Paste student result text here...';
        elements.textInputs.appendChild(newTextArea);
        state.textAreaCount++;
        updateTextCount();
        
        if (state.textAreaCount >= state.MAX_RESULTS) {
            elements.addTextArea.disabled = true;
            elements.addTextArea.innerHTML = '<i class="fas fa-ban"></i> Maximum Reached';
        }
    }
}

function updateTextCount() {
    elements.textCount.textContent = `${state.textAreaCount}/${state.MAX_RESULTS}`;
}

// PDF Processing
function processPDFFiles(files) {
    showProgress('Processing PDF files...');
    
    let processedCount = 0;
    let successfulCount = 0;
    let failedCount = 0;
    const totalFiles = files.length;
    
    files.forEach((file) => {
        processSinglePDF(file).then(result => {
            if (result) {
                state.allResults.push(result);
                successfulCount++;
            } else {
                failedCount++;
            }
            
            processedCount++;
            updateProgress(processedCount / totalFiles * 100, `Processed ${processedCount} of ${totalFiles} files`);
            
            if (processedCount === totalFiles) {
                hideProgress();
                applyFilters();
                updateAnalytics();
                updateAnalyticsCharts();
                showNotification(`Successfully processed ${successfulCount} out of ${totalFiles} PDF files`, 'success');
            }
        }).catch(error => {
            console.error('Error processing PDF:', error);
            failedCount++;
            processedCount++;
            updateProgress(processedCount / totalFiles * 100);
            
            if (processedCount === totalFiles) {
                hideProgress();
                applyFilters();
                updateAnalytics();
                updateAnalyticsCharts();
                showNotification(`Processed ${successfulCount} out of ${totalFiles} files with ${failedCount} errors`, 'warning');
            }
        });
    });
}

function processSinglePDF(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        
        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);
            
            pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                const totalPages = pdf.numPages;
                let extractedText = '';
                let pagesProcessed = 0;
                
                for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                    pdf.getPage(pageNum).then(function(page) {
                        return page.getTextContent();
                    }).then(function(textContent) {
                        let pageText = '';
                        let lastY = -1;
                        let lineText = '';
                        
                        textContent.items.forEach(function(textItem) {
                            if (lastY !== -1 && Math.abs(lastY - textItem.transform[5]) > 5) {
                                pageText += lineText + '\n';
                                lineText = '';
                            }
                            
                            lineText += textItem.str + ' ';
                            lastY = textItem.transform[5];
                        });
                        
                        if (lineText) {
                            pageText += lineText + '\n';
                        }
                        
                        extractedText += pageText;
                        pagesProcessed++;
                        
                        if (pagesProcessed === totalPages) {
                            const result = parseResultText(extractedText);
                            resolve(result);
                        }
                    }).catch(reject);
                }
            }).catch(reject);
        };
        
        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(file);
    });
}

// Text Parsing
function parseAllResults() {
    showProgress('Parsing text results...');
    
    state.allResults = [];
    const textAreas = document.querySelectorAll('.result-text');
    let processedCount = 0;
    let successfulCount = 0;
    let failedCount = 0;
    const totalTexts = Array.from(textAreas).filter(ta => ta.value.trim()).length;
    
    if (totalTexts === 0) {
        hideProgress();
        showNotification('No text results found to parse', 'error');
        return;
    }
    
    textAreas.forEach(textArea => {
        const text = textArea.value.trim();
        if (text) {
            setTimeout(() => {
                const result = parseResultText(text);
                if (result) {
                    state.allResults.push(result);
                    successfulCount++;
                } else {
                    failedCount++;
                }
                
                processedCount++;
                updateProgress(processedCount / totalTexts * 100, `Parsed ${processedCount} of ${totalTexts} results`);
                
                if (processedCount === totalTexts) {
                    hideProgress();
                    applyFilters();
                    updateAnalytics();
                    updateAnalyticsCharts();
                    showNotification(`Successfully parsed ${successfulCount} out of ${totalTexts} text results`, 'success');
                }
            }, 0);
        }
    });
}

function parseResultText(text) {
    const lines = text.split('\n');
    
    // Initialize variables
    let studentName = '-';
    let motherName = '-';
    let seatNo = '-';
    let prn = '-';
    let branch = '-';
    let college = '-';
    let center = '-';
    let resultDate = '-';
    let sgpa = '-';
    let totalCredits = '-';
    
    const subjects = [];
    let inSubjectSection = false;
    
    // Parse each line
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Extract basic information
        if (line.includes('Student Name:')) {
            const nameParts = line.split('Mother Name:');
            if (nameParts.length > 1) {
                studentName = nameParts[0].replace('Student Name:', '').trim();
                motherName = nameParts[1].trim();
            } else {
                studentName = extractValueAfterColon(line, lines[i+1]);
            }
        } else if (line.includes('Mother Name:') && motherName === '-') {
            motherName = extractValueAfterColon(line, lines[i+1]);
        } else if (line.includes('Seat No:')) {
            const seatParts = line.split('Center:');
            if (seatParts.length > 1) {
                seatNo = seatParts[0].replace('Seat No:', '').trim();
                center = seatParts[1].trim();
            } else {
                seatNo = extractValueAfterColon(line, lines[i+1]);
            }
        } else if (line.includes('PRN:') || line.includes('Perm Reg No(PRN):')) {
            prn = extractValueAfterColon(line, lines[i+1]);
        } else if (line.includes('Branch/Course:')) {
            branch = extractValueAfterColon(line, lines[i+1]);
        } else if (line.includes('College Name:')) {
            college = extractValueAfterColon(line, lines[i+1]);
        } else if (line.includes('Center:') && center === '-') {
            center = extractValueAfterColon(line, lines[i+1]);
        } else if (line.includes('RESULT DATE:')) {
            resultDate = extractValueAfterColon(line, lines[i+1]);
        } else if (line.includes('TOTAL CREDITS EARNED')) {
            // Extract total credits
            const creditsMatch = line.match(/TOTAL CREDITS.*?(\d+)/);
            if (creditsMatch) {
                totalCredits = creditsMatch[1];
            }
            
            // Extract SGPA
            const sgpaMatch = line.match(/SGPA.*?([\d.]+)/);
            if (sgpaMatch) {
                sgpa = sgpaMatch[1];
            } else {
                const sgpaColonMatch = line.match(/SGPA.*?:.*?([\d.-]+)/);
                if (sgpaColonMatch) {
                    sgpa = sgpaColonMatch[1];
                }
            }
            
            if (sgpa === '--') sgpa = 'N/A';
        }
        
        // Parse subject data
        if ((line === 'Sem' || line.includes('Sem')) && 
            (lines[i+1] && lines[i+1].includes('SubCode')) && 
            (lines[i+2] && lines[i+2].includes('Subject Name'))) {
            inSubjectSection = true;
            i += 2;
            continue;
        }
        
        if (inSubjectSection) {
            if (line.includes('TOTAL CREDITS EARNED') || line.includes('RESULT DATE')) {
                inSubjectSection = false;
                continue;
            }
            
            const subjectMatch = line.match(/^(\d+)\s+(\d+[A-Z]?)\s+([A-Za-z\s\.&]+?)\s+(\d+)\s+([A-Z\+]+)\s+(\d+)$/);
            
            if (subjectMatch) {
                subjects.push({
                    sem: subjectMatch[1],
                    code: subjectMatch[2],
                    name: subjectMatch[3].trim(),
                    credits: subjectMatch[4],
                    grade: subjectMatch[5],
                    gradePoints: subjectMatch[6]
                });
            }
        }
    }
    
    // Return parsed result
    return {
        studentName: studentName || '-',
        motherName: motherName || '-',
        seatNo: seatNo || '-',
        prn: prn || '-',
        branch: branch || '-',
        college: college || '-',
        center: center || '-',
        resultDate: resultDate || '-',
        sgpa: sgpa || '-',
        totalCredits: totalCredits || '-',
        subjects: subjects
    };
}

function extractValueAfterColon(line, nextLine) {
    if (line.includes(':')) {
        const parts = line.split(':');
        if (parts.length > 1) {
            const value = parts.slice(1).join(':').trim();
            if (value) return value;
        }
    }
    
    if (nextLine && !nextLine.includes(':') && nextLine.trim()) {
        return nextLine.trim();
    }
    
    return '-';
}

// Filtering and Sorting
function applyFilters() {
    state.filteredResults = [...state.allResults];
    
    // Apply search filter
    const searchTerm = elements.searchInput.value.toLowerCase();
    if (searchTerm) {
        state.filteredResults = state.filteredResults.filter(result => 
            result.studentName.toLowerCase().includes(searchTerm) ||
            result.seatNo.toLowerCase().includes(searchTerm) ||
            result.prn.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply SGPA filter
    const sgpaValue = elements.sgpaFilter.value;
    if (sgpaValue) {
        state.filteredResults = state.filteredResults.filter(result => {
            if (sgpaValue === 'no-pointer') {
                return result.sgpa === 'N/A' || result.sgpa === '-' || result.sgpa === '--';
            }
            
            const sgpa = parseFloat(result.sgpa);
            if (isNaN(sgpa)) return false;
            
            switch(sgpaValue) {
                case '9+': return sgpa >= 9.0;
                case '8-9': return sgpa >= 8.0 && sgpa < 9.0;
                case '7-8': return sgpa >= 7.0 && sgpa < 8.0;
                case '6-7': return sgpa >= 6.0 && sgpa < 7.0;
                case '0-6': return sgpa < 6.0;
                default: return true;
            }
        });
    }
    
    // Apply branch filter
    const branchValue = elements.branchFilter.value;
    if (branchValue) {
        state.filteredResults = state.filteredResults.filter(result => 
            result.branch.includes(branchValue)
        );
    }
    
    // Apply sorting
    const sortValue = elements.sortOrder.value;
    if (sortValue) {
        state.filteredResults.sort((a, b) => {
            switch(sortValue) {
                case 'sgpa-high':
                    return (parseFloat(b.sgpa) || 0) - (parseFloat(a.sgpa) || 0);
                case 'sgpa-low':
                    return (parseFloat(a.sgpa) || 0) - (parseFloat(b.sgpa) || 0);
                case 'credits-high':
                    return (parseInt(b.totalCredits) || 0) - (parseInt(a.totalCredits) || 0);
                case 'credits-low':
                    return (parseInt(a.totalCredits) || 0) - (parseInt(b.totalCredits) || 0);
                case 'name-asc':
                    return a.studentName.localeCompare(b.studentName);
                default:
                    return 0;
            }
        });
    }
    
    // Reset to first page
    state.currentPage = 1;
    updateResultsDisplay();
    updateUI();
}

// Results Display
function updateResultsDisplay() {
    const startIndex = (state.currentPage - 1) * state.resultsPerPage;
    const endIndex = Math.min(startIndex + state.resultsPerPage, state.filteredResults.length);
    const currentResults = state.filteredResults.slice(startIndex, endIndex);
    
    if (state.filteredResults.length === 0) {
        elements.resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No Results Found</h3>
                <p>${state.allResults.length === 0 ? 'Parse some results first' : 'Try adjusting your filters'}</p>
            </div>
        `;
        return;
    }
    
    elements.resultsContainer.innerHTML = currentResults.map((result, index) => `
        <div class="student-card" data-index="${startIndex + index}">
            <div class="student-header">
                <div class="student-name">${result.studentName}</div>
                <div class="student-meta">
                    <span>${result.seatNo}</span>
                    <span>SGPA: ${result.sgpa}</span>
                    <span>Credits: ${result.totalCredits}</span>
                </div>
            </div>
            <div class="student-content">
                <div class="student-info-grid">
                    <div class="info-item">
                        <div class="info-label">Mother's Name</div>
                        <div class="info-value">${result.motherName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">PRN</div>
                        <div class="info-value">${result.prn}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Branch</div>
                        <div class="info-value">${result.branch}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">College</div>
                        <div class="info-value">${result.college}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Center</div>
                        <div class="info-value">${result.center}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Result Date</div>
                        <div class="info-value">${result.resultDate}</div>
                    </div>
                </div>
                
                <div class="performance-stats">
                    <div class="sgpa-display">
                        <div class="sgpa-value">${result.sgpa}</div>
                        <div class="sgpa-label">SGPA</div>
                    </div>
                    <div class="credits-display">
                        <div class="credits-value">${result.totalCredits}</div>
                        <div class="credits-label">Credits Earned</div>
                    </div>
                </div>
                
                ${result.subjects && result.subjects.length > 0 ? `
                    <table class="subjects-table">
                        <thead>
                            <tr>
                                <th>Sem</th>
                                <th>Code</th>
                                <th>Subject</th>
                                <th>Credits</th>
                                <th>Grade</th>
                                <th>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${result.subjects.map(subject => `
                                <tr>
                                    <td>${subject.sem}</td>
                                    <td>${subject.code}</td>
                                    <td>${subject.name}</td>
                                    <td>${subject.credits}</td>
                                    <td>${subject.grade}</td>
                                    <td>${subject.gradePoints}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<p>No subject data available</p>'}
            </div>
        </div>
    `).join('');
    
    // Add click events for expansion
    elements.resultsContainer.querySelectorAll('.student-header').forEach(header => {
        header.addEventListener('click', function() {
            const card = this.parentElement;
            card.classList.toggle('expanded');
        });
    });
}

// Pagination
function goToPreviousPage() {
    if (state.currentPage > 1) {
        state.currentPage--;
        updateResultsDisplay();
        updateUI();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(state.filteredResults.length / state.resultsPerPage);
    if (state.currentPage < totalPages) {
        state.currentPage++;
        updateResultsDisplay();
        updateUI();
    }
}

// Analytics
function updateAnalytics() {
    if (state.allResults.length === 0) {
        elements.avgSgpa.textContent = '0.00';
        elements.totalStudents.textContent = '0';
        elements.avgCredits.textContent = '0';
        elements.failedSubjects.textContent = '0';
        return;
    }
    
    // Calculate average SGPA
    const validSgpas = state.allResults
        .map(r => parseFloat(r.sgpa))
        .filter(sgpa => !isNaN(sgpa));
    const avgSgpa = validSgpas.length > 0 ? 
        (validSgpas.reduce((a, b) => a + b, 0) / validSgpas.length).toFixed(2) : '0.00';
    
    // Calculate average credits
    const validCredits = state.allResults
        .map(r => parseInt(r.totalCredits))
        .filter(credits => !isNaN(credits));
    const avgCredits = validCredits.length > 0 ? 
        Math.round(validCredits.reduce((a, b) => a + b, 0) / validCredits.length) : '0';
    
    // Count failed subjects
    const failedSubjects = state.allResults.reduce((total, result) => {
        if (result.subjects) {
            return total + result.subjects.filter(s => s.grade === 'F').length;
        }
        return total;
    }, 0);
    
    elements.avgSgpa.textContent = avgSgpa;
    elements.totalStudents.textContent = state.allResults.length;
    elements.avgCredits.textContent = avgCredits;
    elements.failedSubjects.textContent = failedSubjects;
}

// Analytics Charts
function updateAnalyticsCharts() {
    if (state.allResults.length === 0) {
        resetAnalyticsCharts();
        return;
    }
    
    updatePerformanceDistribution();
    updateSgpaChart();
    updatePerformanceSummary();
}

function resetAnalyticsCharts() {
    // Reset performance distribution
    elements.excellentCount.textContent = '0';
    elements.excellentPercent.textContent = '0%';
    elements.veryGoodCount.textContent = '0';
    elements.veryGoodPercent.textContent = '0%';
    elements.goodCount.textContent = '0';
    elements.goodPercent.textContent = '0%';
    elements.averageCount.textContent = '0';
    elements.averagePercent.textContent = '0%';
    elements.needsImprovementCount.textContent = '0';
    elements.needsImprovementPercent.textContent = '0%';
    elements.failedCountAnalytics.textContent = '0';
    elements.failedPercent.textContent = '0%';
    
    // Reset SGPA chart
    document.querySelectorAll('.chart-bar .bar-fill').forEach(bar => {
        bar.style.height = '0%';
    });
    
    // Reset performance summary
    elements.highestSgpa.textContent = '0.00';
    elements.lowestSgpa.textContent = '0.00';
    elements.passPercentage.textContent = '0%';
    elements.topperCount.textContent = '0';
}

function updatePerformanceDistribution() {
    // Count students in each performance category
    const excellent = state.allResults.filter(r => {
        const sgpa = parseFloat(r.sgpa);
        return !isNaN(sgpa) && sgpa >= 9.0;
    }).length;
    
    const veryGood = state.allResults.filter(r => {
        const sgpa = parseFloat(r.sgpa);
        return !isNaN(sgpa) && sgpa >= 8.0 && sgpa < 9.0;
    }).length;
    
    const good = state.allResults.filter(r => {
        const sgpa = parseFloat(r.sgpa);
        return !isNaN(sgpa) && sgpa >= 7.0 && sgpa < 8.0;
    }).length;
    
    const average = state.allResults.filter(r => {
        const sgpa = parseFloat(r.sgpa);
        return !isNaN(sgpa) && sgpa >= 6.0 && sgpa < 7.0;
    }).length;
    
    const needsImprovement = state.allResults.filter(r => {
        const sgpa = parseFloat(r.sgpa);
        return !isNaN(sgpa) && sgpa < 6.0;
    }).length;
    
    const failed = state.allResults.filter(r => {
        return r.sgpa === 'N/A' || r.sgpa === '-' || r.sgpa === '--';
    }).length;
    
    // Calculate percentages
    const total = state.allResults.length;
    const excellentPercent = total > 0 ? ((excellent / total) * 100).toFixed(1) : 0;
    const veryGoodPercent = total > 0 ? ((veryGood / total) * 100).toFixed(1) : 0;
    const goodPercent = total > 0 ? ((good / total) * 100).toFixed(1) : 0;
    const averagePercent = total > 0 ? ((average / total) * 100).toFixed(1) : 0;
    const needsImprovementPercent = total > 0 ? ((needsImprovement / total) * 100).toFixed(1) : 0;
    const failedPercent = total > 0 ? ((failed / total) * 100).toFixed(1) : 0;
    
    // Update DOM
    elements.excellentCount.textContent = excellent;
    elements.excellentPercent.textContent = `${excellentPercent}%`;
    elements.veryGoodCount.textContent = veryGood;
    elements.veryGoodPercent.textContent = `${veryGoodPercent}%`;
    elements.goodCount.textContent = good;
    elements.goodPercent.textContent = `${goodPercent}%`;
    elements.averageCount.textContent = average;
    elements.averagePercent.textContent = `${averagePercent}%`;
    elements.needsImprovementCount.textContent = needsImprovement;
    elements.needsImprovementPercent.textContent = `${needsImprovementPercent}%`;
    elements.failedCountAnalytics.textContent = failed;
    elements.failedPercent.textContent = `${failedPercent}%`;
}

function updateSgpaChart() {
    // Count students in each SGPA range
    const excellent = state.allResults.filter(r => {
        const sgpa = parseFloat(r.sgpa);
        return !isNaN(sgpa) && sgpa >= 9.0;
    }).length;
    
    const veryGood = state.allResults.filter(r => {
        const sgpa = parseFloat(r.sgpa);
        return !isNaN(sgpa) && sgpa >= 8.0 && sgpa < 9.0;
    }).length;
    
    const good = state.allResults.filter(r => {
        const sgpa = parseFloat(r.sgpa);
        return !isNaN(sgpa) && sgpa >= 7.0 && sgpa < 8.0;
    }).length;
    
    const average = state.allResults.filter(r => {
        const sgpa = parseFloat(r.sgpa);
        return !isNaN(sgpa) && sgpa >= 6.0 && sgpa < 7.0;
    }).length;
    
    const needsImprovement = state.allResults.filter(r => {
        const sgpa = parseFloat(r.sgpa);
        return !isNaN(sgpa) && sgpa < 6.0;
    }).length;
    
    const failed = state.allResults.filter(r => {
        return r.sgpa === 'N/A' || r.sgpa === '-' || r.sgpa === '--';
    }).length;
    
    // Find the maximum count for scaling
    const counts = [excellent, veryGood, good, average, needsImprovement, failed];
    const maxCount = Math.max(...counts);
    
    // Update chart bars
    const bars = document.querySelectorAll('.chart-bar');
    bars[0].querySelector('.bar-fill').style.height = maxCount > 0 ? `${(excellent / maxCount) * 100}%` : '0%';
    bars[1].querySelector('.bar-fill').style.height = maxCount > 0 ? `${(veryGood / maxCount) * 100}%` : '0%';
    bars[2].querySelector('.bar-fill').style.height = maxCount > 0 ? `${(good / maxCount) * 100}%` : '0%';
    bars[3].querySelector('.bar-fill').style.height = maxCount > 0 ? `${(average / maxCount) * 100}%` : '0%';
    bars[4].querySelector('.bar-fill').style.height = maxCount > 0 ? `${(needsImprovement / maxCount) * 100}%` : '0%';
    bars[5].querySelector('.bar-fill').style.height = maxCount > 0 ? `${(failed / maxCount) * 100}%` : '0%';
}

function updatePerformanceSummary() {
    // Calculate highest SGPA
    const validSgpas = state.allResults
        .map(r => parseFloat(r.sgpa))
        .filter(sgpa => !isNaN(sgpa));
    const highestSgpa = validSgpas.length > 0 ? Math.max(...validSgpas).toFixed(2) : '0.00';
    
    // Calculate lowest SGPA
    const lowestSgpa = validSgpas.length > 0 ? Math.min(...validSgpas).toFixed(2) : '0.00';
    
    // Calculate pass percentage
    const passedStudents = state.allResults.filter(r => {
        const sgpa = parseFloat(r.sgpa);
        return !isNaN(sgpa) && sgpa >= 6.0;
    }).length;
    const passPercentage = state.allResults.length > 0 ? 
        ((passedStudents / state.allResults.length) * 100).toFixed(1) : '0';
    
    // Count toppers (SGPA >= 9.0)
    const topperCount = state.allResults.filter(r => {
        const sgpa = parseFloat(r.sgpa);
        return !isNaN(sgpa) && sgpa >= 9.0;
    }).length;
    
    elements.highestSgpa.textContent = highestSgpa;
    elements.lowestSgpa.textContent = lowestSgpa;
    elements.passPercentage.textContent = `${passPercentage}%`;
    elements.topperCount.textContent = topperCount;
}

// Export Functions
function exportToCSV() {
    if (state.allResults.length === 0) {
        showNotification('No results to export', 'error');
        return;
    }
    
    let csvContent = "Student Name,Mother's Name,Seat No,PRN,Branch/Course,College,Center,Result Date,SGPA,Total Credits\n";
    
    state.allResults.forEach(result => {
        const row = [
            `"${result.studentName}"`,
            `"${result.motherName}"`,
            `"${result.seatNo}"`,
            `"${result.prn}"`,
            `"${result.branch}"`,
            `"${result.college}"`,
            `"${result.center}"`,
            `"${result.resultDate}"`,
            `"${result.sgpa}"`,
            `"${result.totalCredits}"`
        ].join(',');
        
        csvContent += row + '\n';
    });
    
    downloadFile(csvContent, 'student_results.csv', 'text/csv');
    showNotification('Results exported to CSV successfully', 'success');
}

function exportToJSON() {
    if (state.allResults.length === 0) {
        showNotification('No results to export', 'error');
        return;
    }
    
    const jsonContent = JSON.stringify(state.allResults, null, 2);
    downloadFile(jsonContent, 'student_results.json', 'application/json');
    showNotification('Results exported to JSON successfully', 'success');
}

function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

// Progress Management
function showProgress(message) {
    elements.progressText.textContent = message;
    elements.progressOverlay.style.display = 'flex';
}

function hideProgress() {
    elements.progressOverlay.style.display = 'none';
}

function updateProgress(percent, message = '') {
    elements.progressFill.style.width = `${percent}%`;
    if (message) {
        elements.progressText.textContent = message;
    }
}

// UI Updates
function updateUI() {
    // Update counts
    elements.resultsCount.textContent = state.allResults.length;
    elements.processedCount.textContent = state.allResults.length;
    elements.successCount.textContent = state.allResults.length;
    
    // Update pagination
    const totalPages = Math.ceil(state.filteredResults.length / state.resultsPerPage);
    elements.pageInfo.textContent = `Page ${state.currentPage} of ${totalPages}`;
    elements.prevPage.disabled = state.currentPage <= 1;
    elements.nextPage.disabled = state.currentPage >= totalPages;
    
    // Update dynamic island if on results tab
    if (document.querySelector('.nav-item[data-tab="results"]').classList.contains('active')) {
        updateDynamicIsland('results');
    }
}

// Reset Application
function resetApplication() {
    state.allResults = [];
    state.filteredResults = [];
    state.textAreaCount = 1;
    state.currentPage = 1;
    
    // Clear text areas
    elements.textInputs.innerHTML = '<textarea class="result-text" placeholder="Paste student result text here..."></textarea>';
    updateTextCount();
    
    // Clear file input
    elements.fileInput.value = '';
    elements.fileInfo.textContent = 'No files selected';
    
    // Clear filters
    elements.searchInput.value = '';
    elements.sgpaFilter.value = '';
    elements.branchFilter.value = '';
    elements.sortOrder.value = '';
    
    // Reset add text area button
    elements.addTextArea.disabled = false;
    elements.addTextArea.innerHTML = '<i class="fas fa-plus"></i> Add Text Area';
    
    applyFilters();
    updateAnalytics();
    showNotification('Application reset successfully', 'success');
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 14px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 10000;
        max-width: 350px;
    }
    
    .notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .notification-success {
        border-left: 4px solid var(--success);
    }
    
    .notification-error {
        border-left: 4px solid var(--danger);
    }
    
    .notification-warning {
        border-left: 4px solid var(--warning);
    }
    
    .notification-info {
        border-left: 4px solid var(--primary);
    }
    
    .notification-icon {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
    }
    
    .notification-success .notification-icon { background: var(--success); }
    .notification-error .notification-icon { background: var(--danger); }
    .notification-warning .notification-icon { background: var(--warning); }
    .notification-info .notification-icon { background: var(--primary); }
    
    .notification-content {
        flex: 1;
    }
    
    .notification-message {
        font-size: 14px;
        font-weight: 500;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
    }
    
    .notification-close:hover {
        background: rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(notificationStyles);



