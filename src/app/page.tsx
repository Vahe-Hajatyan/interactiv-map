import Map from '@/components/Map';

const HomePage: React.FC = () => {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

  return (
    <div className="flex flex-col h-full">
      <Map mapboxToken={mapboxToken} />
    </div>
  );
};

export default HomePage;
