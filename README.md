# logo_scraper
Node script that takes a spreadsheet of websites, and downloads the logo from that website


Directions:
 
-Put your excel file containing websites in the project directory

-Create a folder called "output" in the project directory


How It Works:
 
This script parses through the html of every site available on the spreadsheet and looks for img tags where the source attribute contains the word "logo".
