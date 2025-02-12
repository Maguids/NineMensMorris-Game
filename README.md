# Nine Men's Morris - Online Game

This project was developed for the "Web Tecnologies" course and aims to **develop a web application in all its aspects**. In this project I'm developing a web version of the game Nine Men's Morris, **both with a local and online version**. First Semester of the Third Year of the Bachelor's Degree in Artificial Intelligence and Data Science.

<br>

## Programming Language:

<div style = "display: inline_block"><br/>
    <img align="center" alt="python" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img align="center" alt="html" src="https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white" />
  <img align="center" alt="css" src="https://img.shields.io/badge/CSS-239120?&style=for-the-badge&logo=css3&logoColor=white" />
</div><br/>

<br>

## The Project
This project is divided into three distinct parts, each of which complements the other, as in reality it is as if it were a single project that was developed little by little.

<br>

### Deliver 1:
In the first delivery the goal was to have a single page application that was divided into different areas for the following purposes:

- Logo
- Settings
- Commands
- Identification
- Board
- Instructions
- Classifications
- Messages
- AI

Note that these areas do not need to be visible at all times, and that some may temporarily overlap with others.

**Settings:**
In the settings you can define:
- Board size;
- Play against the computer or another player;
- First player to play;
- Level of artificial intelligence;

<p align="center">
  <img width="500" height="400" src="https://github.com/user-attachments/assets/02a29434-f118-4dd8-84b8-656ad825d4bc">
</p>

<br>

**AI:**
It is possible to play against different levels of AI, being that:
- **Easy Mode:** Performs random moves;
- **Intermediate Mode:** Prioritizes making mills when possible;
- **Hard Mode:** Blocks the opponent from making windmills and prioritizes making mills;

<p align="center">
  <img width="800" height="400" src="https://github.com/user-attachments/assets/69aaa396-9112-49bf-a7f6-c07cac6799fb">
</p>

<br>

### Deliver 2:
The goal of the second deliver is to **make the game distributed**, **allowing players to participate on different computers**.

At this stage we simply adapted the code so that it would be **possible to use the server provided by the teacher**, and it is possible to perform the following actions:
- **register:** register a player with nickname and password
- **join:** joins two players who want to play a game with a certain board size. If there is a player waiting for a game with the same characteristics then they are matched immediately. Otherwise, the player is registered for later pairing.
- **leave:** Function called to leave the game. If it is summoned during pairing, while waiting for other players, then it has no consequences. If the game is already underway, exiting using this method grants victory to the opponent.
- **notify:** This function notifies the server about a move.
- **update:** Gives players updates on changes made to the server
- **ranking:** Returns a ranking table with a maximum of 10 players, ranked in descending order of the number of victories.



<br>

### Deliver 3:
The objective of the third delivery is the **development of the game server in Node, without frameworks**, replicating and replacing the server used in the second delivery.

### Other Server:
Although I can't use frameworks, I decided to **create a server using frameworks** that are in the "Server" folder.

<br>

## About the repository:

All deliveries have the following contents:
- game.js ➡️The code with the game and buttons;
- index.html ➡️ Html file;
- style.css ➡️ Style the website page;

Regarding the server:
- controllers ➡️ Folder with files for each of the server 'actions';
- data ➡️ Files were server info is saved such as players and their passwords, games status...;
- utils ➡️ Files with utilities that can be used on multiple files like encrypt;

<br>

## Link to the course: 

This course is part of the **<u>first semester</u>** of the **<u>third year</u>** of the **<u>Bachelor's Degree in Artificial Intelligence and Data Science</u>** at **<u>FCUP</u>** and **<u>FEUP</u>** in the academic year 2024/2025. You can find more information about this course at the following link:

<div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
  <a href="https://sigarra.up.pt/fcup/pt/ucurr_geral.ficha_uc_view?pv_ocorrencia_id=425182">
    <img alt="Link to Course" src="https://img.shields.io/badge/Link_to_Course-0077B5?style=for-the-badge&logo=logoColor=white" />
  </a>

  <div style="display: flex; gap: 10px; justify-content: center;">
    <a href="https://sigarra.up.pt/fcup/pt/web_page.inicial">
      <img alt="FCUP" src="https://img.shields.io/badge/FCUP-808080?style=for-the-badge&logo=logoColor=grey" />
    </a>
    <a href="https://sigarra.up.pt/feup/pt/web_page.inicial">
      <img alt="FEUP" src="https://img.shields.io/badge/FEUP-808080?style=for-the-badge&logo=logoColor=grey" />
    </a>
  </div>
</div>
