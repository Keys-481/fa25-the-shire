/**
 * Root application component.
 * Serves as the entry point for routing logic by rendering AppRoutes,
 * which defines all the available routes in the application.
 *
 * @component
 * @returns {JSX.Element} The main application layout with route handling
 */

import AppRoutes from './routes/AppRoutes'

export default function App() {
  return <AppRoutes />
}
