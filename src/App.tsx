import { AuthProvider } from "./contexts/AuthContext";
import AppRouter from "./AppRouter";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppRouter />
      </div>
    </AuthProvider>
  );
}

export default App;
