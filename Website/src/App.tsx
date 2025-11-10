import { Routes, Route } from 'react-router-dom'
import { Layout, Questionnaires } from './pages';

const App = () => {
   return ( 
      <>
         <Layout>
            <Routes>
               <Route path='/' element={<Questionnaires />} />
            </Routes>
         </Layout>
      </>
   );
}
 
export default App;