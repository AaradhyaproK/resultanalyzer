# Academic Result Analyzer

## Overview

The Academic Result Analyzer is a web application designed to streamline the process of analyzing student academic performance. It allows users to upload PDF result files or paste result text, automatically parsing the data to extract key information like student names, seat numbers, SGPA, and subject details. The application provides tools to filter, sort, and export the analyzed data, making it easier to gain insights into academic performance trends.

## Features

*   **Data Input:**
    *   **PDF Upload:** Users can upload multiple PDF result files. The application utilizes the PDF.js library to extract text from the PDFs.
    *   **Text Input:** Users can paste result data directly into text areas. This is useful for copying results from online portals or other sources.
*   **Data Processing:**
    *   **Parsing Algorithm:** The application uses regular expressions and string manipulation techniques to parse the extracted text data. It identifies patterns to extract student information (name, seat number, PRN, branch, etc.) and subject details (subject code, name, credits, grade).
*   **Results Display:**
    *   **Filtering:** Users can filter results based on:
        *   Search term (name, seat number, PRN)
        *   SGPA range (Excellent, Very Good, Good, Average, Needs Improvement, Failed)
        *   Academic program (e.g., S.E., T.E., B.E.)
    *   **Sorting:** Users can sort results by:
        *   SGPA (High to Low, Low to High)
        *   Credits (High to Low, Low to High)
        *   Name (A to Z)
    *   **Pagination:** Results are displayed in a paginated format for easy navigation.
*   **Analytics:**
    *   **Performance Metrics:** The application calculates and displays key performance metrics:
        *   Average SGPA
        *   Total Students Processed
        *   Average Credits Earned
        *   Number of Failed Subjects
    *   **Performance Distribution:** The application categorizes students based on their SGPA range (Excellent, Very Good, Good, Average, Needs Improvement, Failed) and displays the distribution as counts and percentages.
    *   **Performance Summary:** Key summary statistics are provided:
        *   Highest SGPA
        *   Lowest SGPA
        *   Pass Percentage
        *   Number of Toppers (SGPA >= 9.0)
    *   **SGPA Distribution Chart:** A bar chart visually represents the distribution of students across different SGPA ranges.
*   **Data Export:**
    *   **CSV Export:** Exports the data in CSV (Comma Separated Values) format, suitable for opening in spreadsheet applications like Microsoft Excel or Google Sheets.
    *   **JSON Export:** Exports the data in JSON (JavaScript Object Notation) format, a widely used data interchange format.
    *   **PDF Report Generation (Planned):** *Future feature*. A comprehensive performance report will be generated as a PDF document.

## Technologies Used

*   **HTML, CSS, JavaScript:** Core web technologies for building the user interface and application logic.
*   **PDF.js:** A JavaScript library developed by Mozilla for parsing and rendering PDF documents. Used for extracting text from PDF result files.
*   **Font Awesome:** A popular icon library used for visual elements in the UI.

## PDF Text Extraction Logic

1.  **PDF.js Initialization:** The application initializes PDF.js and sets the worker source for background processing.
2.  **File Reading:** When a PDF file is uploaded, it's read as an ArrayBuffer using FileReader.
3.  **PDF Document Parsing:** The ArrayBuffer is passed to `pdfjsLib.getDocument()` to parse the PDF document.
4.  **Page Iteration:** The application iterates through each page of the PDF document.
5.  **Text Content Extraction:** For each page, `page.getTextContent()` is called to extract the text content as a text item array.
6.  **Text Content Processing:**
    *   The text items are processed to reconstruct the text as it appears in the PDF. This involves handling line breaks and spaces based on the text item positions.
    *   The extracted text from all pages is concatenated into a single string.

## Data Parsing Algorithm

The data parsing algorithm is responsible for extracting relevant information from the extracted text. The key steps are:

1.  **Text Splitting:** The extracted text is split into lines.
2.  **Line-by-Line Processing:** The application iterates through each line and applies pattern matching using regular expressions.
3.  **Information Extraction:**
    *   **Student Information:** Regular expressions are used to identify lines containing student names, seat numbers, PRN, branch, college, center, and result date.
    *   **Subject Details:** The algorithm identifies the subject table section (based on header lines like "Sem", "SubCode", "Subject Name") and extracts subject code, name, credits, grade, and grade points for each subject.
    *   **SGPA and Total Credits:** Regular expressions are used to extract SGPA and total credits earned from the result summary section.
4.  **Data Structure Creation:** The extracted data is stored in a JavaScript object for each student, with properties for student information, SGPA, total credits, and an array of subject details.

## Filtering and Sorting Algorithms

*   **Filtering:** The filtering logic iterates through the array of student results and applies filter conditions based on user selections. The filter conditions include:
    *   **Search Term:** The `String.prototype.toLowerCase()` and `String.prototype.includes()` methods are used to perform case-insensitive searches on student names, seat numbers, and PRNs.
    *   **SGPA Range:** Filter conditions are based on comparing the student's SGPA with the selected range boundaries.
    *   **Academic Program:** A simple string comparison is used to filter results by academic program.
*   **Sorting:** The `Array.prototype.sort()` method is used to sort the student results based on user-selected criteria. A custom comparison function is used to compare two student objects based on the sorting criteria (SGPA, credits, or name).
    *   **SGPA and Credits:** The `parseFloat()` and `parseInt()` functions are used to convert the SGPA and credits to numbers for comparison.
    *   **Name:** The `String.prototype.localeCompare()` method is used to perform alphabetical sorting of student names.

## Front-End Structure

The front-end is designed with a responsive layout using HTML and CSS. Key UI components include:

*   **Dynamic Island:** A floating section at the top that displays contextual information and actions.
*   **Sidebar:** Provides navigation to different sections of the application (Data Input, Results, Analytics, Export).
*   **Main Content Area:** Displays the content for the selected tab.
*   **Input Cards:** Allow users to upload PDF files or paste text data.
*   **Results Table:** Displays the filtered and sorted student results in a table format.
*   **Analytics Charts and Statistics:** Displayed using HTML and CSS, no external charting libraries are used for simplicity.
*   **Progress Overlay:** Shows the progress of data processing tasks.

## Installation and Setup

1.  Clone the repository: `git clone [repository URL]`
2.  Open the `index.html` file in your web browser.
3.  The application should now be running locally.

## Usage

1.  **Data Input:**
    *   Upload PDF result files using the "PDF Document Upload" card.
    *   Paste result text into the text areas in the "Text Input" card.
2.  **Process Data:** Click the "Process All Data" button to parse the input data.
3.  **View Results:** Navigate to the "Student Results" tab to view the parsed results.
4.  **Filter and Sort:** Use the filters and sorting options to refine the results.
5.  **Analytics:** Go to the "Performance Analytics" tab to view performance metrics and charts.
6.  **Export Data:** Navigate to the "Data Export" tab and select the desired export format (CSV, JSON).

## Planned Future Enhancements

*   **PDF Report Generation:** Implement the ability to generate comprehensive performance reports as PDF documents.
*   **Data Visualization Library:** Integrate a charting library (e.g., Chart.js) for more advanced and customizable charts.
*   **Data Persistence:** Implement data persistence (e.g., using local storage or a database) to save and load analyzed data.
*   **User Authentication:** Add user authentication for data security and privacy.
*   **Improved PDF Parsing:** Enhance the PDF parsing algorithm to handle different result formats and layouts more robustly.

## Contributing

Contributions are welcome! Please submit pull requests or open issues to suggest improvements or report bugs.

## License

[MIT License](LICENSE)
