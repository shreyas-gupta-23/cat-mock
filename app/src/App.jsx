import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import ExamScreen from './components/ExamScreen';
import ResultScreen from './components/ResultScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/exam" element={<ExamScreen />} />
        <Route path="/result" element={<ResultScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
