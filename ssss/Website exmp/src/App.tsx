import { Routes, Route } from 'react-router-dom'
import { Layout, Questionnaires} from './pages';
import { Profile } from './pages';

const App = () => {
   return ( 
      <>
         <Layout>
            <Routes>
               <Route path='/' element={<Questionnaires />} />
               <Route path='/profile' element={<Profile />} />
            </Routes>
         </Layout>
      </>
   );
}
 
export default App;