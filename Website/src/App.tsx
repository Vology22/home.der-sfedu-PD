import { Routes, Route } from 'react-router-dom'
import { ExtendedCard, Filter, Layout, Like, Questionnaires, Profile } from './pages';

const App = () => {
   return ( 
      <>
         <Layout>
            <Routes>
               <Route path='/' element={<Questionnaires />} />
               <Route path='card/:id' element={<ExtendedCard />} />
               <Route path='/like' element={<Like />} />
               <Route path='/filter' element={<Filter />} />
               <Route path='/profile' element={<Profile />} />
            </Routes>
         </Layout>
      </>
   );
}
 
export default App;