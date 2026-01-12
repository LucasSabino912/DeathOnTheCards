import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import WaitScreen from './containers/waitScreen/WaitScreen.jsx'
import CreateScreen from './containers/createScreen/CreateScreen.jsx'
import LobbyScreen from './containers/lobbyScreen/LobbyScreen.jsx'
import GameScreen from './containers/gameScreen/GameScreen.jsx'
import JoinScreen from './containers/joinScreen/JoinScreen.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { GameProvider } from './context/GameContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <GameProvider autoReconnect={true}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="lobby" element={<LobbyScreen />} />
            <Route path="newgame" element={<CreateScreen />} />
            <Route path = "/game_join/:gameId" element = {<WaitScreen/>} />
            <Route path = "/game/:gameId" element={<GameScreen />} />
            <Route path="games" element={<JoinScreen />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </UserProvider>
  </StrictMode>
)
