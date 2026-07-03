import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaLeaf,
  FaTruck,
  FaShoppingCart,
  FaArrowRight,
  FaStar
} from 'react-icons/fa';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaLeaf />,
      title: 'Farm Fresh',
      description:
        'Directly sourced from farmers. No storage delays, only fresh harvest.',
    },
    {
      icon: <FaTruck />,
      title: 'Fast Delivery',
      description:
        'Reliable delivery within 24–48 hours from farm to doorstep.',
    },
    {
      icon: <FaShoppingCart />,
      title: 'Easy Shopping',
      description:
        'Browse multiple farms and order seamlessly in seconds.',
    },
  ];

  const topFarmers = [
    { id: 1, name: 'Green Valley Farm', rating: 4.8, orders: 250, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
    { id: 2, name: 'Organic Harvest', rating: 4.7, orders: 180, image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80' },
    { id: 3, name: 'Fresh Fields', rating: 4.9, orders: 320, image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <div className="min-h-screen overflow-hidden">

      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-500 text-white py-24">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,white,transparent_60%)]" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative">

          {/* LEFT */}
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Fresh Produce <br />
              <span className="text-emerald-200">
                Directly From Farmers
              </span>
            </h1>

            <p className="text-lg text-white/90 mb-10 max-w-xl">
              Skip middlemen and buy fresh vegetables & fruits straight from
              local farms. Better prices, better quality, healthier living.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-7 py-3 rounded-xl bg-white text-primary-600 font-bold hover:bg-neutral-100 transition flex items-center gap-2 shadow-lg"
              >
                Get Started <FaArrowRight />
              </button>

              <button
                onClick={() => navigate('/products')}
                className="px-7 py-3 rounded-xl border border-white/80 hover:bg-white hover:text-primary-600 transition flex items-center gap-2"
              >
                Browse Products <FaArrowRight />
              </button>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden lg:block relative">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3MRBY3CNpxA_zzEl8fdtwP74sASAeH6g1ZQ&s"
              alt="Fresh produce"
              className="rounded-3xl shadow-2xl relative z-10"
            />
            <div className="absolute -bottom-6 -right-6 w-full h-full bg-white/10 rounded-3xl blur-xl" />
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-4xl font-bold mb-16">
            Why Choose FreshFarm?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white"
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary-50 text-primary-600 text-2xl mb-5 mx-auto">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold mb-3">
                  {feature.title}
                </h3>

                <p className="text-neutral-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TOP FARMERS ================= */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-16">
            Top Rated Farmers
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {topFarmers.map((farmer) => (
              <div
                key={farmer.id}
                className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm hover:shadow-xl transition hover:-translate-y-1"
              >
               <div className="w-16 h-16 rounded-full overflow-hidden mb-5 border-2 border-white shadow">
  <img
    src={farmer.image}   // <-- image from data
    alt={farmer.name}
    className="w-full h-full object-cover"
  />
</div>

                <h3 className="text-xl font-bold mb-2">
                  {farmer.name}
                </h3>

                <div className="flex items-center gap-2 mb-5">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold">
                    {farmer.rating}
                  </span>
                  <span className="text-neutral-500 text-sm">
                    ({farmer.orders} orders)
                  </span>
                </div>

                <button className="w-full py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition font-semibold">
                  View Products
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-emerald-500 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">

          <h2 className="text-4xl font-bold mb-6">
            Ready to eat fresh?
          </h2>

          <p className="text-lg text-white/90 mb-10">
            Join thousands already buying directly from farmers and
            enjoying healthier, fresher food every day.
          </p>

          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 rounded-xl bg-white text-primary-600 font-bold hover:bg-neutral-100 transition shadow-lg flex items-center gap-2 mx-auto"
          >
            Start Shopping Now <FaArrowRight />
          </button>

        </div>
      </section>

    </div>
  );
};

export default HomePage;