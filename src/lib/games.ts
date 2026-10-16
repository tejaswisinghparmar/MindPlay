export type GameInfo={id:string,title:string,description:string,category:string,art:string,tag?:string};
export const games:GameInfo[]=[
{id:'guess-number',title:'Guess the Number',description:'A little intuition goes a long way.',category:'Quick play',art:'dice',tag:'Classic'},
{id:'memory',title:'Memory Match',description:'Flip, remember, and find every pair.',category:'Puzzle',art:'memory'},
{id:'math',title:'Math Challenge',description:'How many can you solve before time runs out?',category:'Brain training',art:'math'},
{id:'reaction',title:'Reaction Test',description:'Test the speed of your reflexes.',category:'Quick play',art:'reaction'},
{id:'2048',title:'2048',description:'Combine the tiles. Chase the perfect score.',category:'Puzzle',art:'tiles',tag:'Popular'},
{id:'snake',title:'Snake',description:'Grow longer. Think ahead. Don’t collide.',category:'Arcade',art:'snake'},
{id:'word-guess',title:'Word Guess',description:'Crack the hidden word in six tries.',category:'Brain training',art:'word'},
{id:'tic-tac-toe',title:'Tic-Tac-Toe',description:'A timeless little battle of strategy.',category:'Strategy',art:'tictactoe'},
{id:'space-dodger',title:'Space Dodger',description:'Slip through the asteroid field.',category:'Arcade',art:'space'},
{id:'jigsaw',title:'Jigsaw Puzzle',description:'Piece together a little moment of calm.',category:'Puzzle',art:'jigsaw',tag:'Relax'},
{id:'chess',title:'Chess',description:'A classic game of patience and planning.',category:'Strategy',art:'chess'},
{id:'sudoku',title:'Sudoku',description:'A clear grid. A satisfying solution.',category:'Brain training',art:'sudoku'},
{id:'flappy',title:'Sky Hop',description:'Tap to fly. Find your rhythm.',category:'Arcade',art:'flappy'},
{id:'ping-pong',title:'Ping Pong',description:'Keep the rally alive and outscore your rival.',category:'Arcade',art:'pingpong',tag:'New'}
];
