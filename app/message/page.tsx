import Image from 'next/image';
import instagramIcon from '@/public/instagramIcon.svg';
import messengerIcon from '@/public/messengerIcon.svg';
import IntegrationCard from './(components)/IntegrationCard';

export default function Message() {
  return (
    <main className="min-h-screen bg-white p-16">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Integrations
      </h1>

      <section className="flex flex-wrap gap-6">
        <IntegrationCard
          name="Messenger"
          status="connected"
          image={
            <Image
              src={messengerIcon}
              alt="Messenger"
              className="h-5 w-5"
            />
          }
        />

        <IntegrationCard
          name="Instagram"
          status="not connected"
          image={
            <Image
              src={instagramIcon}
              alt="Instagram"
              className="h-5 w-5"
            />
          }
        />
      </section>
    </main>
  );
}