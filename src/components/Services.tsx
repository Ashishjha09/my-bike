import { motion } from "motion/react";
import { Wrench, ShieldCheck, CreditCard, Headphones, Settings, Award } from "lucide-react";

const services = [
  {
    icon: <Wrench className="w-6 h-6" />,
    title: "Expert Servicing",
    description: "Factory-trained technicians using state-of-the-art diagnostic tools to keep your machine at peak performance."
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Genuine Spares",
    description: "We only use 100% authentic parts, ensuring longevity and maintaining your vehicle's factory warranty."
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Easy Finance",
    description: "Flexible payment plans and quick loan approvals with our partner banks to make your dream ride a reality."
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: "24/7 Support",
    description: "Round-the-clock roadside assistance and customer support for complete peace of mind on every journey."
  },
  {
    icon: <Settings className="w-6 h-6" />,
    title: "Customization",
    description: "Personalize your ride with our range of premium accessories and custom performance tuning services."
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Extended Warranty",
    description: "Protect your investment with our comprehensive extended warranty programs covering major components."
  }
];

export default function Services() {
  return (
    <section id="services" className="py-32 bg-[#0a0a0a] border-y border-white/5">
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Header */}
        <div className="max-w-2xl mb-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-[1px] bg-yellow-500"></span>
            <span className="text-[10px] font-bold tracking-[0.5em] text-yellow-500 uppercase">Our Expertise</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase italic">
            BEYOND THE<br />
            <span className="text-white/20">SHOWROOM.</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-[#0a0a0a] p-12 hover:bg-[#0d0d0d] transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-yellow-500 mb-8 group-hover:bg-yellow-500 group-hover:text-black transition-all duration-500">
                {service.icon}
              </div>
              
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 group-hover:text-yellow-500 transition-colors">
                {service.title}
              </h3>
              
              <p className="text-white/40 text-sm leading-relaxed font-medium">
                {service.description}
              </p>

              <div className="mt-10 flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white transition-colors cursor-pointer">
                Learn More <div className="w-4 h-[1px] bg-current"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
