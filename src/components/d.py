import requests
from bs4 import BeautifulSoup
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

results = []
DELAY = .3  # seconds between requests
MAX_WORKERS = 3  # concurrent requests

def scrape_page(page_num):
    url = f"https://surahquran.com/page-quran-{page_num}.html"
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all verse numbers in labels
        verse_labels = soup.find_all('label')
        verse_numbers = []
        
        for label in verse_labels:
            # Extract number from (xxx) pattern
            match = re.search(r'\((\d+)\)', label.text)
            if match:
                verse_numbers.append(int(match.group(1)))
        
        if len(verse_numbers) >= 2:
            first = verse_numbers[0]
            last = verse_numbers[-1]
            return (page_num, [first, last])
        else:
            print(f"Page {page_num}: Couldn't find verse numbers")
            return None
            
    except Exception as e:
        print(f"Error on page {page_num}: {str(e)}")
        return None
    finally:
        time.sleep(DELAY)

def main():
    total_pages = 604
    pages = range(1, total_pages + 1)
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(scrape_page, page): page for page in pages}
        
        for future in as_completed(futures):
            result = future.result()
            if result:
                page_num, verses = result
                results.append((page_num, verses))
                print(f"Page {page_num}: {verses}")
    
    # Sort results by page number (since multithreaded)
    results_sorted = [v for p, v in sorted(results, key=lambda x: x[0])]
    
    # Save to JS file for Vue.js
    with open('info.js', 'w', encoding='utf-8') as f:
        f.write("// Auto-generated Quran verses data\n")
        f.write("// Format: [firstVerse, lastVerse] for each page (1-604)\n")
        f.write("export const quranPageVerses = [\n")
        
        # Write array elements with proper formatting
        for i, verses in enumerate(results_sorted, 1):
            f.write(f"  {verses}")
            if i < len(results_sorted):
                f.write(",")
            f.write(f" // Page {i}\n")
        
        f.write("];\n")
    
    print("\nData saved to info.js in Vue.js export format")

if __name__ == "__main__":
    main()