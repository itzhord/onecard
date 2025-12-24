import DigitalBusinessCard from '../../components/Card1';
import DigitalBusinessCard2 from '@/components/Card2';
import DigitalBusinessCard3 from '@/components/Card3';
import DigitalBusinessCard4 from '@/components/Card4';

const DigitalCardPage = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-row items-center justify-center gap-4 p-4">
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <DigitalBusinessCard />
                <DigitalBusinessCard2 />
                <DigitalBusinessCard3 />
                <DigitalBusinessCard4 />
            </div>
        </div>
    );
}

export default DigitalCardPage;