import { useNavigate } from 'react-router-dom'

export default function AdminNavBar({ title }) {
  const navigate = useNavigate()

  return (
    <div style={styles.navbar}>
      <button onClick={() => navigate('/admin/dashboard')} style={styles.backButton}>←</button>
      <h2 style={styles.title}>| {title}</h2>
    </div>
  )
}

const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#09347a',
    borderBottom: '2px solid #f1632a',
  },
  backButton: {
    fontSize: '30px',
    marginRight: '10px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
  },
  title: {
    margin: 0,
    color: '#FFFFFF',
    fontSize: '22px',
  },
}
