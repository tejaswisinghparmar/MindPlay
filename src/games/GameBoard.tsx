import {useCallback,useEffect,useRef,useState} from 'react';import {RotateCcw,Play,Pause,Volume2,VolumeX,ArrowUp,ArrowDown,ArrowLeft,ArrowRight,Lightbulb,Check,Flag} from 'lucide-react';import type { GameInfo } from '../lib/games';
import { Chess } from 'chess.js';
import { WORD_LIST } from './wordlist';
function record(id:string,score:number,label?:string){try{const rs=JSON.parse(localStorage.getItem('mindplay-results')||'[]');rs.unshift({gameId:id,score,label,date:new Date().toISOString()});localStorage.setItem('mindplay-results',JSON.stringify(rs.slice(0,50)));const b=JSON.parse(localStorage.getItem('mindplay-bests')||'{}');const better=id==='reaction'?(b[id]===undefined||score<b[id]):(b[id]===undefined||score>b[id]);if(better){b[id]=score;localStorage.setItem('mindplay-bests',JSON.stringify(b))}}catch{}}
const rand=(n:number)=>Math.floor(Math.random()*n);
export default function GameBoard({game}:{game:GameInfo}){const [key,setKey]=useState(0);return <div className="game-board-wrap"><div className="game-board-top"><div><span className="eyebrow">READY WHEN YOU ARE</span><p>Take your time. Have fun.</p></div><button className="soft-button" onClick={()=>setKey(k=>k+1)}><RotateCcw size={15}/> Restart</button></div><div className="game-board" key={key}>{game.id==='guess-number'?<Guess id={game.id}/>:game.id==='tic-tac-toe'?<TicTac/>:game.id==='2048'?<Twenty48/>:game.id==='memory'?<Memory/>:game.id==='math'?<MathGame/>:game.id==='reaction'?<Reaction/>:game.id==='ping-pong'?<PingPong/>:game.id==='snake'?<Snake/>:game.id==='word-guess'?<WordGuess/>:game.id==='sudoku'?<Sudoku/>:game.id==='flappy'?<Flappy/>:game.id==='space-dodger'?<SpaceDodger/>:game.id==='jigsaw'?<Jigsaw/>:<ChessLite/>}</div></div>}
function Guess({id}:{id:string}){const [target,setTarget]=useState(()=>1+rand(6)),[tries,setTries]=useState(0),[msg,setMsg]=useState('Choose a number from 1 to 6.'),[done,setDone]=useState(false);function guess(n:number){if(done)return;const t=tries+1;setTries(t);if(n===target){setMsg(`You got it in ${t} ${t===1?'try':'tries'}!`);setDone(true);record(id,Math.max(0,7-t),`${t} tries`)}else setMsg(n<target?'A little higher. Try again.':'A little lower. Try again.')}return <div className="mini-game"><div className="game-stat"><span>Attempts</span><b>{tries}</b></div><h2>{done?'Nicely done!':'What’s the number?'}</h2><p>{msg}</p><div className="number-choices">{[1,2,3,4,5,6].map(n=><button key={n} onClick={()=>guess(n)} disabled={done}>{n}</button>)}</div>{done&&<button className="button button-dark" onClick={()=>{setTarget(1+rand(6));setTries(0);setDone(false);setMsg('Choose a number from 1 to 6.')}}>Play again <RotateCcw size={15}/></button>}</div>}
function TicTac(){const [board,setBoard]=useState<string[]>(Array(9).fill('')),[turn,setTurn]=useState('X');const win=winner(board);function play(i:number){if(board[i]||win)return;const b=[...board];b[i]=turn;setBoard(b);setTurn(turn==='X'?'O':'X');if(winner(b)){record('tic-tac-toe',1,`${turn} wins`)}else if(b.every(Boolean))record('tic-tac-toe',0,'Draw')}return <div className="mini-game"><h2>{win?`${win} wins!`:board.every(Boolean)?'It’s a draw!':`${turn}’s turn`}</h2><p>Take turns choosing a square.</p><div className="ttt-grid">{board.map((v,i)=><button key={i} onClick={()=>play(i)} className={v?'marked':''}>{v}</button>)}</div><button className="button button-dark" onClick={()=>{setBoard(Array(9).fill(''));setTurn('X')}}><RotateCcw size={15}/> New round</button></div>}
function winner(b:string[]){for(const [a,c,d] of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]])if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];return ''}
function Twenty48(){const [board,setBoard]=useState(()=>newBoard()),[score,setScore]=useState(0),[over,setOver]=useState(false);function move(dir:string){if(over)return;let b=board.map(r=>[...r]),gain=0;for(let line=0;line<4;line++){let coords=Array.from({length:4},(_,i)=>dir==='left'?[line,i]:dir==='right'?[line,3-i]:dir==='up'?[i,line]:[3-i,line]);let vals=coords.map(([r,c])=>b[r][c]).filter(Boolean);for(let i=0;i<vals.length-1;i++)if(vals[i]===vals[i+1]){vals[i]*=2;gain+=vals[i];vals.splice(i+1,1)}vals=[...vals,...Array(4-vals.length).fill(0)];coords.forEach(([r,c],i)=>b[r][c]=vals[i])}if(JSON.stringify(b)!==JSON.stringify(board)){b=addTile(b);setBoard(b);setScore(s=>s+gain);if(!b.some(r=>r.includes(0))&&!b.some((r,i)=>r.some((v,j)=>(i<3&&b[i+1][j]===v)||(j<3&&r[j+1]===v)))){setOver(true);record('2048',score+gain,`${score+gain} points`)}}}useEffect(()=>{const fn=(e:KeyboardEvent)=>{const m:Record<string,string>={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(m[e.key]){e.preventDefault();move(m[e.key])}};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn)});return <div className="mini-game"><div className="game-stat"><span>Score</span><b>{score}</b></div><h2>Make it to 2048.</h2><p>Use your arrow keys or the controls below to slide the tiles.</p><div className="tile-board">{board.flat().map((v,i)=><div className={`tile tile-${Math.min(v,2048)}`} key={i}>{v||''}</div>)}</div><div className="dpad-controls"><button onClick={()=>move('up')}><ArrowUp/></button><div><button onClick={()=>move('left')}><ArrowLeft/></button><button onClick={()=>move('down')}><ArrowDown/></button><button onClick={()=>move('right')}><ArrowRight/></button></div></div>{over&&<p className="success-message">No more moves. Score: {score}</p>}<button className="button button-dark" onClick={()=>{setBoard(newBoard());setScore(0);setOver(false)}}><RotateCcw size={15}/> New game</button></div>}
function newBoard(){return addTile(addTile(Array.from({length:4},()=>Array(4).fill(0))))}function addTile(b:number[][]){const empty:[number,number][]=[];b.forEach((r,i)=>r.forEach((v,j)=>{if(!v)empty.push([i,j])}));if(empty.length){const [r,c]=empty[rand(empty.length)];b[r][c]=Math.random()<.9?2:4}return b}
function Memory(){const vals=['✦','◈','●','▲','◆','✿'];const [deck,setDeck]=useState(()=>shuffle([...vals,...vals].map((v,i)=>({v,id:i})))),[open,setOpen]=useState<number[]>([]),[matched,setMatched]=useState<number[]>([]),[moves,setMoves]=useState(0);function flip(i:number){if(open.length===2||open.includes(i)||matched.includes(i))return;const next=[...open,i];setOpen(next);if(next.length===2){setMoves(m=>m+1);if(deck[next[0]].v===deck[next[1]].v){setMatched(m=>[...m,...next]);setOpen([]);if(matched.length+2===deck.length)record('memory',Math.max(0,100-moves),`${moves+1} moves`)}else setTimeout(()=>setOpen([]),650)}}return <div className="mini-game"><div className="game-stat"><span>Moves</span><b>{moves}</b><span>Pairs</span><b>{matched.length/2}/6</b></div><h2>Find the matching pairs.</h2><p>Remember what you see, then find its partner.</p><div className="memory-grid">{deck.map((d,i)=><button key={d.id} className={open.includes(i)||matched.includes(i)?'flipped':''} onClick={()=>flip(i)}>{open.includes(i)||matched.includes(i)?d.v:'?'}</button>)}</div><button className="button button-dark" onClick={()=>{setDeck(shuffle([...vals,...vals].map((v,i)=>({v,id:i}))));setOpen([]);setMatched([]);setMoves(0)}}><RotateCcw size={15}/> Shuffle cards</button></div>}
function shuffle<T,>(a:T[]){return a.map(v=>({v,r:Math.random()})).sort((x,y)=>x.r-y.r).map(x=>x.v)}
function MathGame(){const [q,setQ]=useState(()=>question()),[score,setScore]=useState(0),[left,setLeft]=useState(30),[active,setActive]=useState(false),[done,setDone]=useState(false);useEffect(()=>{if(!active||done)return;const t=setInterval(()=>setLeft(s=>{if(s<=1){clearInterval(t);setDone(true);record('math',score,`${score} correct`);return 0}return s-1}),1000);return()=>clearInterval(t)},[active,done,score]);function answer(n:number){if(!active||done)return;if(n===q.a)setScore(s=>s+1);setQ(question())}return <div className="mini-game"><div className="game-stat"><span>Time left</span><b>{left}s</b><span>Score</span><b>{score}</b></div><h2>{done?'Time’s up!':active?`${q.x} ${q.op} ${q.y} = ?`:'Ready for a quick brain warm-up?'}</h2><p>{done?`You solved ${score} correctly.`:'Solve as many as you can in 30 seconds.'}</p>{!active&&!done?<button className="button button-dark" onClick={()=>setActive(true)}><Play size={15}/> Start challenge</button>:<><div className="answer-grid">{q.options.map(n=><button key={n} disabled={done} onClick={()=>answer(n)}>{n}</button>)}</div>{done&&<button className="button button-dark" onClick={()=>{setQ(question());setScore(0);setLeft(30);setDone(false);setActive(false)}}>Try again <RotateCcw size={15}/></button>}</>}</div>}
function question(){const x=1+rand(12),y=1+rand(12),op=Math.random()>.5?'+':'−',a=op==='+'?x+y:x-y;const opts=shuffle([a,a+1,a-1,a+2]).filter((v,i,a)=>a.indexOf(v)===i);while(opts.length<4)opts.push(a+opts.length+2);return{x,y,op,a,options:shuffle(opts.slice(0,4))}}
function Reaction(){const [phase,setPhase]=useState('idle'),[start,setStart]=useState(0),[result,setResult]=useState<number|null>(null);const timer=useRef<any>(null);function begin(){setResult(null);setPhase('wait');timer.current=setTimeout(()=>{setStart(performance.now());setPhase('go')},1000+rand(2500))}function hit(){if(phase==='wait'){clearTimeout(timer.current);setPhase('early')}else if(phase==='go'){const ms=Math.round(performance.now()-start);setResult(ms);setPhase('result');record('reaction',ms,`${ms} ms`)}}useEffect(()=>()=>clearTimeout(timer.current),[]);return <div className="mini-game"><h2>{phase==='go'?'NOW!':phase==='wait'?'Wait for green…':phase==='early'?'Too soon!':phase==='result'?`${result} ms`:'How fast are your reflexes?'}</h2><p>{phase==='idle'?'Start, wait for the color to change, then tap as quickly as you can.':phase==='result'?'Try again to beat your time.':phase==='early'?'You jumped the gun. Try again.':'Click the field when it turns green.'}</p><button className={`reaction-field ${phase==='go'?'is-go':''} ${phase==='wait'?'is-wait':''}`} onClick={phase==='idle'||phase==='result'||phase==='early'?begin:hit}>{phase==='idle'||phase==='result'||phase==='early'?'Start test':phase==='go'?'TAP!':'Wait…'}</button></div>}
function PingPong(){const canvas=useRef<HTMLCanvasElement>(null),[running,setRunning]=useState(false),[scores,setScores]=useState([0,0]),[mode,setMode]=useState('ai'),[finished,setFinished]=useState(false);const game=useRef({x:300,y:180,vx:4,vy:2,p:150,ai:150,playerScore:0,aiScore:0,keys:new Set<string>()});useEffect(()=>{const c=canvas.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;let raf=0;const w=600,h=360;function draw(){ctx.clearRect(0,0,w,h);ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--board').trim()||'#eef2fa';ctx.fillRect(0,0,w,h);ctx.strokeStyle='rgba(90,120,180,.35)';ctx.setLineDash([8,9]);ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();ctx.setLineDash([]);const g=game.current;ctx.fillStyle='#4385ff';ctx.beginPath();ctx.roundRect(18,g.p,10,62,5);ctx.fill();ctx.fillStyle='#9b8aff';ctx.beginPath();ctx.roundRect(w-28,g.ai,10,62,5);ctx.fill();ctx.fillStyle='#fff';ctx.shadowColor='rgba(30,60,100,.2)';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(g.x,g.y,8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;if(running&&!finished){if(g.keys.has('ArrowUp')||g.keys.has('w'))g.p-=5;if(g.keys.has('ArrowDown')||g.keys.has('s'))g.p+=5;g.p=Math.max(0,Math.min(h-62,g.p));if(mode==='ai')g.ai+=(g.y-(g.ai+31))*.075;else{if(g.keys.has('i'))g.ai-=5;if(g.keys.has('k'))g.ai+=5}g.ai=Math.max(0,Math.min(h-62,g.ai));g.x+=g.vx;g.y+=g.vy;if(g.y<8||g.y>h-8)g.vy*=-1;if(g.x<36&&g.y>g.p-8&&g.y<g.p+70)g.vx=Math.abs(g.vx)*1.04;if(g.x>w-36&&g.y>g.ai-8&&g.y<g.ai+70)g.vx=-Math.abs(g.vx)*1.04;if(g.x<0||g.x>w){const left=g.x<0;const next=[scores[0]+(left?0:1),scores[1]+(left?1:0)];setScores(next);g.playerScore=next[0];g.aiScore=next[1];if(Math.max(...next)>=7){setFinished(true);setRunning(false);record('ping-pong',left?next[1]:next[0],left?'AI wins': 'Player wins')}g.x=w/2;g.y=h/2;g.vx=(left?-1:1)*4;g.vy=Math.random()*4-2}}raf=requestAnimationFrame(draw)}draw();return()=>cancelAnimationFrame(raf)},[running,mode,finished,scores]);useEffect(()=>{const down=(e:KeyboardEvent)=>{game.current.keys.add(e.key);if(['ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault()},up=(e:KeyboardEvent)=>game.current.keys.delete(e.key);window.addEventListener('keydown',down);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}},[]);function reset(){game.current={...game.current,x:300,y:180,vx:4,vy:2,p:150,ai:150,playerScore:0,aiScore:0};setScores([0,0]);setFinished(false);setRunning(false)}return <div className="mini-game ping-game"><div className="game-stat"><span>You</span><b>{scores[0]}</b><span>{mode==='ai'?'AI':'Player 2'}</span><b>{scores[1]}</b></div><h2>{finished?(scores[0]>scores[1]?'You win the match!':'Match complete!'):'First to 7 wins.'}</h2><p>Move with ↑ / ↓ or W / S. Player two uses I / K.</p><canvas ref={canvas} width="600" height="360" className="ping-canvas"/><div className="pong-controls"><label>Opponent <select value={mode} onChange={e=>{setMode(e.target.value);reset()}}><option value="ai">Play vs AI</option><option value="local">Two players</option></select></label><button className="button button-dark" onClick={()=>finished?reset():setRunning(v=>!v)}>{running?<Pause size={15}/>:<Play size={15}/>} {running?'Pause':finished?'New match':'Start rally'}</button><button className="soft-button" onClick={reset}><RotateCcw size={15}/> Reset</button></div></div>}
function Snake(){const [snake,setSnake]=useState([[7,7],[6,7],[5,7]]),[food,setFood]=useState([rand(14),rand(14)]),[dir,setDir]=useState([1,0]),[running,setRunning]=useState(false),[over,setOver]=useState(false),[score,setScore]=useState(0);const ref=useRef({snake,food,dir,over});ref.current={snake,food,dir,over};useEffect(()=>{const f=(e:KeyboardEvent)=>{const d:Record<string,number[]>={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};if(d[e.key]){e.preventDefault();const n=d[e.key];if(n[0]!==-dir[0]||n[1]!==-dir[1])setDir(n)}};window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f)},[dir]);useEffect(()=>{if(!running||over)return;const t=setInterval(()=>{const {snake,food,dir}=ref.current;const h=[snake[0][0]+dir[0],snake[0][1]+dir[1]],eat=h[0]===food[0]&&h[1]===food[1];if(h[0]<0||h[0]>=14||h[1]<0||h[1]>=14||snake.some((p,i)=>i>0&&p[0]===h[0]&&p[1]===h[1])){setOver(true);setRunning(false);record('snake',score,`${score} points`);return}setSnake([h,...snake.slice(0,eat?snake.length:snake.length-1)]);if(eat){setScore(s=>s+1);setFood([rand(14),rand(14)])}},160);return()=>clearInterval(t)},[running,over,score]);return <div className="mini-game"><div className="game-stat"><span>Apples</span><b>{score}</b></div><h2>{over?'Game over':running?'Stay sharp.':'Ready to slither?'}</h2><p>Use arrow keys or WASD to move.</p><div className="snake-board">{Array.from({length:196},(_,i)=>{const x=i%14,y=Math.floor(i/14),si=snake.findIndex(p=>p[0]===x&&p[1]===y);return <div key={i} className={si===0?'snake-head':si>0?'snake-body':food[0]===x&&food[1]===y?'snake-food':''}/>})}</div><button className="button button-dark" onClick={()=>{if(over){setSnake([[7,7],[6,7],[5,7]]);setFood([rand(14),rand(14)]);setDir([1,0]);setScore(0);setOver(false)}setRunning(v=>!v)}}>{running?<Pause size={15}/>:<Play size={15}/>} {running?'Pause':over?'Play again':'Start'}</button></div>}
function WordGuess() {
  const pickWord = () => WORD_LIST[rand(WORD_LIST.length)];
  const [answer, setAnswer] = useState<string>(() => pickWord());
  const [guess, setGuess] = useState('');
  const [rows, setRows] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState('Six tries. One five-letter word.');

  function submit() {
    if (guess.length !== 5) {
      setMsg('Enter a five-letter word.');
      return;
    }
    const word = guess.toUpperCase();
    if (!WORD_LIST.includes(word)) {
      setMsg('That word is not in this simple-English list. Try another.');
      return;
    }
    const next = [...rows, word];
    setRows(next);
    setGuess('');
    if (word === answer) {
      setDone(true);
      setMsg('You found the word!');
      record('word-guess', 7 - next.length, `${next.length} tries`);
    } else if (next.length >= 6) {
      setDone(true);
      setMsg(`The word was ${answer}. Better luck next round!`);
      record('word-guess', 0, 'Not solved');
    } else {
      setMsg('Not quite. Green is correct, yellow is in the word.');
    }
  }

  function tileStatuses(word: string) {
    const statuses = Array(5).fill('absent');
    const remaining: Record<string, number> = {};
    for (let index = 0; index < 5; index += 1) {
      if (word[index] === answer[index]) {
        statuses[index] = 'correct';
      } else {
        remaining[answer[index]] = (remaining[answer[index]] || 0) + 1;
      }
    }
    for (let index = 0; index < 5; index += 1) {
      if (statuses[index] === 'correct') continue;
      if (remaining[word[index]] > 0) {
        statuses[index] = 'present';
        remaining[word[index]] -= 1;
      }
    }
    return statuses;
  }

  function newRound() {
    setAnswer(current => {
      if (WORD_LIST.length < 2) return pickWord();
      let next = pickWord();
      while (next === current) next = pickWord();
      return next;
    });
    setGuess('');
    setRows([]);
    setDone(false);
    setMsg('Six tries. One five-letter word.');
  }

  return <div className="mini-game">
    <h2>{done ? 'Round complete' : 'Guess the hidden word.'}</h2>
    <p>{msg}</p>
    <div className="word-rows">{Array.from({ length: 6 }, (_, row) =>
      <div key={row} className="word-row">{Array.from({ length: 5 }, (_, col) => {
        const value = rows[row]?.[col] || (row === rows.length ? guess[col] || '' : '');
        const statuses = rows[row] ? tileStatuses(rows[row]) : [];
        return <span className={statuses[col] || ''} key={col}>{value}</span>;
      })}</div>,
    )}</div>
    {!done && <form className="word-form" onSubmit={event => { event.preventDefault(); submit(); }}>
      <input aria-label="Five-letter guess" autoComplete="off" value={guess} onChange={event => setGuess(event.target.value.replace(/[^a-z]/ig, '').slice(0, 5).toUpperCase())} maxLength={5} placeholder="TYPE WORD" />
      <button className="button button-dark" type="submit">Submit</button>
    </form>}
    <button className="soft-button" onClick={newRound}><RotateCcw size={15}/> New round</button>
  </div>;
}

function Sudoku(){const puzzle=[5,3,0,0,7,0,0,0,0,6,0,0,1,9,5,0,0,0,0,9,8,0,0,0,0,6,0,8,0,0,0,6,0,0,0,3,4,0,0,8,0,3,0,0,1,7,0,0,0,2,0,0,0,6,0,6,0,0,0,0,2,8,0,0,0,0,4,1,9,0,0,5,0,0,0,0,8,0,0,7,9];const [vals,setVals]=useState(puzzle),[sel,setSel]=useState(0),[msg,setMsg]=useState('Select an empty cell, then choose a number.');function put(n:number){if(puzzle[sel])return;const v=[...vals];v[sel]=n;setVals(v);if(v.every(Boolean)){setMsg('Grid filled! Check each row, column and box.');if(v.every((x,i)=>x===puzzle[i]||x>0))record('sudoku',1,'Grid filled')}}return <div className="mini-game"><h2>Find your flow.</h2><p>{msg}</p><div className="sudoku-grid">{vals.map((v,i)=><button key={i} onClick={()=>setSel(i)} className={`${sel===i?'selected':''} ${puzzle[i]?'fixed':''}`} style={{borderRight:(i%9===2||i%9===5)?'2px solid var(--line-strong)':undefined,borderBottom:(Math.floor(i/9)===2||Math.floor(i/9)===5)?'2px solid var(--line-strong)':undefined}}>{v||''}</button>)}</div><div className="sudoku-numbers">{[1,2,3,4,5,6,7,8,9].map(n=><button key={n} onClick={()=>put(n)}>{n}</button>)}<button onClick={()=>{if(!puzzle[sel])setVals(v=>v.map((x,i)=>i===sel?0:x))}}>⌫</button></div><button className="soft-button" onClick={()=>{setVals(puzzle);setMsg('Select an empty cell, then choose a number.')}}><RotateCcw size={15}/> Reset puzzle</button></div>}
function Flappy(){const [y,setY]=useState(50),[v,setV]=useState(0),[pipe,setPipe]=useState(85),[score,setScore]=useState(0),[running,setRunning]=useState(false),[over,setOver]=useState(false);const ref=useRef<any>({y,v,pipe,score,running,over});ref.current={y,v,pipe,score,running,over};useEffect(()=>{const f=(e:KeyboardEvent)=>{if(e.code==='Space'){e.preventDefault();if(over){setY(50);setV(-4);setPipe(85);setScore(0);setOver(false);setRunning(true)}else{setV(-4);setRunning(true)}}};window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f)},[over]);useEffect(()=>{if(!running||over)return;const t=setInterval(()=>{setV(v=>v+.35);setY(y=>{const ny=y+v;if(ny>94||ny<3){setOver(true);setRunning(false);record('flappy',score,`${score} gates`)}return Math.max(2,Math.min(96,ny))});setPipe(p=>{if(p<0){setScore(s=>s+1);return 105}return p-2.1})},35);return()=>clearInterval(t)},[running,over,v,score]);return <div className="mini-game"><h2>{over?'Whoops!':running?'Keep flying.':'A tiny flight of fancy.'}</h2><p>Tap or press Space to flap and keep clear of the edges.</p><div className="flappy-field" onClick={()=>{if(over){setY(50);setV(-4);setPipe(85);setScore(0);setOver(false)}setRunning(true);setV(-4)}}><div className="flappy-score">{score}</div><div className="bird" style={{top:`${y}%`}}>●</div><div className="pipe pipe-top" style={{left:`${pipe}%`}}/><div className="pipe pipe-bottom" style={{left:`${pipe}%`}}/></div><button className="button button-dark" onClick={()=>{if(over){setY(50);setV(0);setPipe(85);setScore(0);setOver(false)}setRunning(v=>!v)}}>{running?<Pause size={15}/>:<Play size={15}/>} {running?'Pause':over?'Try again':'Start flight'}</button></div>}
function SpaceDodger(){const [x,setX]=useState(50),[rocks,setRocks]=useState([{x:22,y:10},{x:75,y:40},{x:40,y:70}]),[score,setScore]=useState(0),[running,setRunning]=useState(false),[over,setOver]=useState(false);useEffect(()=>{const f=(e:KeyboardEvent)=>{if(e.key==='ArrowLeft'||e.key==='a')setX(x=>Math.max(5,x-5));if(e.key==='ArrowRight'||e.key==='d')setX(x=>Math.min(95,x+5))};window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f)},[]);useEffect(()=>{if(!running||over)return;const t=setInterval(()=>{setRocks(r=>r.map(o=>({...o,y:o.y+3})).map(o=>o.y>100?{x:5+rand(90),y:-10}:o));setScore(s=>s+1);const hit=rocks.some(o=>o.y>80&&o.y<95&&Math.abs(o.x-x)<8);if(hit){setOver(true);setRunning(false);record('space-dodger',score,`${score} survived`)}},150);return()=>clearInterval(t)},[running,over,rocks,x,score]);return <div className="mini-game"><h2>{over?'Mission over.':running?'Dodge incoming!':'Ready for lift-off?'}</h2><p>Move left and right with arrow keys or A / D.</p><div className="space-field" tabIndex={0}><div className="space-score">{score}</div>{rocks.map((o,i)=><span key={i} className="asteroid" style={{left:`${o.x}%`,top:`${o.y}%`}}>✦</span>)}<span className="ship" style={{left:`${x}%`}}>▲</span><div className="space-touch"><button onClick={()=>setX(v=>Math.max(5,v-8))}><ArrowLeft/></button><button onClick={()=>setX(v=>Math.min(95,v+8))}><ArrowRight/></button></div></div><button className="button button-dark" onClick={()=>{if(over){setRocks([{x:22,y:10},{x:75,y:40},{x:40,y:70}]);setScore(0);setOver(false)}setRunning(v=>!v)}}>{running?<Pause size={15}/>:<Play size={15}/>} {running?'Pause':over?'Play again':'Start'}</button></div>}
function Jigsaw(){const [order,setOrder]=useState(()=>shuffle(Array.from({length:9},(_,i)=>i))),[selected,setSelected]=useState<number|null>(null),[moves,setMoves]=useState(0),[done,setDone]=useState(false);function click(i:number){if(selected===null){setSelected(i);return}const a=[...order];[a[i],a[selected]]=[a[selected],a[i]];setOrder(a);setSelected(null);setMoves(m=>m+1);if(a.every((v,j)=>v===j)){setDone(true);record('jigsaw',Math.max(0,100-moves),`${moves+1} moves`)}}return <div className="mini-game"><div className="game-stat"><span>Moves</span><b>{moves}</b></div><h2>{done?'Picture complete!':'Put the picture together.'}</h2><p>Choose two tiles to swap their positions. Complete the numbered grid.</p><div className="jigsaw-grid">{order.map((v,i)=><button key={i} className={`${selected===i?'selected':''} ${v===i?'in-place':''}`} onClick={()=>click(i)}><span>{v+1}</span><i style={{backgroundPosition:`${(v%3)*50}% ${Math.floor(v/3)*50}%`}}/></button>)}</div><button className="button button-dark" onClick={()=>{setOrder(shuffle(Array.from({length:9},(_,i)=>i)));setSelected(null);setMoves(0);setDone(false)}}><RotateCcw size={15}/> Shuffle puzzle</button></div>}
function ChessLite() {
  const engine = useRef(new Chess());
  const [position, setPosition] = useState(engine.current.fen());
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('White to move. Select a piece, then a destination.');
  const game = engine.current;
  const board = game.board();
  const glyph: Record<string, string> = {
    wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
    bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
  };

  function clickSquare(square: string) {
    if (game.isGameOver()) return;
    if (!selected) {
      const piece = game.get(square as never);
      if (piece && piece.color === game.turn()) setSelected(square);
      return;
    }
    try {
      const move = game.move({ from: selected, to: square, promotion: 'q' });
      if (move) {
        setPosition(game.fen());
        setSelected(null);
        if (game.isCheckmate()) {
          setMessage(`Checkmate — ${game.turn() === 'w' ? 'Black' : 'White'} wins!`);
          record('chess', 1, `${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate`);
        } else if (game.isDraw()) {
          setMessage('Draw. Well played!');
          record('chess', 0, 'Draw');
        } else {
          setMessage(`${game.turn() === 'w' ? 'White' : 'Black'} to move${game.isCheck() ? ' — check!' : '.'}`);
        }
      } else {
        const piece = game.get(square as never);
        setSelected(piece && piece.color === game.turn() ? square : null);
      }
    } catch {
      const piece = game.get(square as never);
      setSelected(piece && piece.color === game.turn() ? square : null);
    }
  }

  function reset() {
    game.reset();
    setPosition(game.fen());
    setSelected(null);
    setMessage('White to move. Select a piece, then a destination.');
  }

  // Referencing position forces a render after each accepted move.
  void position;
  return <div className="mini-game">
    <h2>{game.isCheckmate() ? 'Checkmate!' : game.isDraw() ? 'Game drawn' : 'Chess, at your pace.'}</h2>
    <p>{message}</p>
    <div className="chess-board">{board.flatMap((row, rowIndex) => row.map((piece, colIndex) => {
      const square = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`;
      const key = piece ? `${piece.color}${piece.type}` : '';
      return <button key={square} aria-label={`${square}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`} onClick={() => clickSquare(square)} className={`${(rowIndex + colIndex) % 2 ? 'dark-square' : 'light-square'} ${selected === square ? 'selected' : ''}`}>{key ? glyph[key] : ''}</button>;
    }))}</div>
    <p className="muted-copy">Legal moves, check, checkmate, castling, en passant, and queen promotion are handled by the chess rules engine.</p>
    <button className="button button-dark" onClick={reset}><RotateCcw size={15}/> New game</button>
  </div>;
}
