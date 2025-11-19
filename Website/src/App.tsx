import { Routes, Route } from 'react-router-dom'
import { Filter, Layout, Like, Questionnaires } from './pages';

const App = () => {
   return ( 
      <>
         <Layout>
            <Routes>
               <Route path='/' element={<Questionnaires />} />
               <Route path='/like' element={<Like />} />
               <Route path='/filter' element={<Filter />} />
            </Routes>
         </Layout>
      </>
   );
}
 
export default App;