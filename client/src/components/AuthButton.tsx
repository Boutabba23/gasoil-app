import { useAuth } from '../hooks/useAuth';

export function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span>Bonjour, {user.email}</span>
        <button 
          onClick={signOut}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={signInWithGoogle}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    >
      Se connecter avec Google
    </button>
  );
}
