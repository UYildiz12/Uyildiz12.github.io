import PyPDF2

pdf_files = [
    'HRI_Embodiement_Anonymized .pdf',
    'HRI_Transparency_Anonymized_Final .pdf'
]

for pdf_file in pdf_files:
    with open(pdf_file, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        txt_file = pdf_file.replace('.pdf', '.txt')
        with open(txt_file, 'w', encoding='utf-8') as txt:
            txt.write(text)
        
        print(f'Converted {pdf_file} to {txt_file}')