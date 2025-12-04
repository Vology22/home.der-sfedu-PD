import { Routes, Route } from 'react-router-dom'
import { ExtendedCard, Filter, Layout, Like, Questionnaires } from './pages';

const App = () => {
   return ( 
      <>
         <Layout>
            <Routes>
               <Route path='/' element={<Questionnaires />} />
               <Route path='card/:id' element={<ExtendedCard />} />
               <Route path='/like' element={<Like />} />
               <Route path='/filter' element={<Filter />} />
            </Routes>
         </Layout>
      </>
   );
}
 
export default App;