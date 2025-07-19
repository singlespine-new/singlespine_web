'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  ArrowRight,
  // Package,
  // CheckCircle,
  Shield,
  Truck,
  Heart,
  ShoppingCart,
  CreditCard,
  Gift,
  Users,
  Smile,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    id: 1,
    title: 'Choose Products',
    description: 'Browse a wide selection of authentic local goods.',
    details:
      'Explore our curated marketplace filled with everything from fresh produce to artisan crafts. Simply select the items you want to send and add them to your basket.',
    icon: <ShoppingCart size={28} />,
    iconColor: 'text-primary',
    bgColor: 'from-primary/20 to-primary/30',
  },
  {
    id: 2,
    title: 'Provide Address',
    description: 'Enter the recipient’s address in Ghana.',
    details:
      'Provide the delivery details for your loved one. Our upcoming Ghana Post GPS integration will make this even more precise, ensuring your package reaches the right hands.',
    icon: <MapPin size={28} />,
    iconColor: 'text-primary',
    bgColor: 'from-primary/20 to-primary/30',
  },
  {
    id: 3,
    title: 'Secure Checkout',
    description: 'Complete your purchase with our secure payment system.',
    details:
      'Pay with confidence using our encrypted checkout process. We accept various payment methods to make your transaction smooth and worry-free.',
    icon: <CreditCard size={28} />,
    iconColor: 'text-primary',
    bgColor: 'from-primary/20 to-primary/30',
  },
  {
    id: 4,
    title: 'We Deliver Happiness',
    description: 'We handle the rest, from packaging to delivery.',
    details:
      'Once your order is placed, our team on the ground in Ghana carefully packages your items and ensures they are delivered safely and on time. You can track your order every step of the way.',
    icon: <Truck size={28} />,
    iconColor: 'text-primary',
    bgColor: 'from-primary/20 to-primary/30',
  },
]

const FEATURES = [
  {
    icon: <Gift size={24} />,
    title: 'Authentic Local Products',
    description:
      'We partner with trusted local vendors to bring you genuine Ghanaian goods.',
  },
  {
    icon: <Truck size={24} />,
    title: 'Reliable & Fast Delivery',
    description: 'Our dedicated team ensures your gifts arrive safely and on time.',
  },
  {
    icon: <Shield size={24} />,
    title: 'Secure Payments',
    description:
      'Your transactions are protected with industry-standard encryption.',
  },
  {
    icon: <Users size={24} />,
    title: 'Support Local Economy',
    description: 'Every purchase you make helps support local businesses in Ghana.',
  },
]

// const FAQS = [
//   {
//     question: 'How do I know my order has been received?',
//     answer:
//       "Once you complete your purchase, you'll receive a confirmation email with your order details and a unique order number. You can use this number to track your package.",
//   },
//   {
//     question: 'What are the delivery charges?',
//     answer:
//       'Delivery charges vary based on the location and the size of your order. You can see the final delivery fee at checkout before you confirm your payment.',
//   },
//   {
//     question: 'How long does delivery take?',
//     answer:
//       'Delivery times typically range from 1-3 business days within major cities like Accra and Kumasi, and may take longer for more remote areas. We aim to deliver as quickly as possible!',
//   },
//   {
//     question: 'Can I send a personalized message with my gift?',
//     answer:
//       'Absolutely! During the checkout process, you will have an option to add a personalized message, which we will include with your delivery.',
//   },
// ]

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(1)
  // const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/10 to-primary/5">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
              🌍 Connecting Hearts Across Continents
            </div> */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              How <span className="text-primary">Singlespine</span> Works
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Sending love to your family in Ghana has never been easier. From
              authentic products to reliable delivery, we handle everything so
              you can focus on what matters most - staying connected.
            </p>

            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                placeholder="Enter their address to see what's available nearby..."
                size="lg"
                containerClassName="shadow-lg bg-white/90 dark:bg-background/80 backdrop-blur-sm"
                icon={<MapPin className="text-primary" size={20} />}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Try: &ldquo;Accra&rdquo;, &ldquo;Kumasi&rdquo;, or use Ghana
                Post GPS codes
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="font-semibold">
                <Link href="/products">Start Shopping</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FC8120' fill-opacity='1'%3E%3Cpath d='M60 0L80 40L120 60L80 80L60 120L40 80L0 60L40 40Z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '120px 120px',
            }}
          />
        </div>
      </section>

      {/* How It Works Steps */}
      <section id="how-it-works" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple Steps, Meaningful Connections
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From browsing to delivery, we&apos;ve made it effortless to send
              gifts that matter to the people you love most.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-center items-center mb-12 space-y-4 md:space-y-0 md:space-x-8">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setActiveStep(step.id)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300',
                      activeStep === step.id
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-border/40 hover:border-primary/50 hover:bg-primary/5'
                    )}
                  >
                    <div
                      className={cn(
                        'flex-shrink-0 p-3 rounded-full text-white',
                        `bg-gradient-to-br ${step.bgColor}`
                      )}
                    >
                      {step.icon}
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="font-semibold text-foreground">
                        Step {step.id}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {step.title}
                      </div>
                    </div>
                  </button>
                  {index < STEPS.length - 1 && (
                    <ArrowRight className="hidden md:block w-6 h-6 text-muted-foreground mx-4" />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-card border border-border/40 rounded-2xl p-8 md:p-12 shadow-lg min-h-[350px]">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    'transition-all duration-500 ease-in-out',
                    activeStep === step.id
                      ? 'opacity-100 transform-none'
                      : 'opacity-0 absolute'
                  )}
                  style={{ visibility: activeStep === step.id ? 'visible' : 'hidden' }}
                >
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={cn(
                            'p-4 rounded-xl text-white',
                            `bg-gradient-to-br ${step.bgColor}`
                          )}
                        >
                          {step.icon}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground">
                            Step {step.id} of {STEPS.length}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg text-muted-foreground mb-4">
                        {step.description}
                      </p>
                      <p className="text-foreground leading-relaxed">
                        {step.details}
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-full md:w-80 h-64 bg-gradient-to-br from-secondary/20 to-primary/10 rounded-xl flex items-center justify-center">
                      <div className="text-6xl opacity-50">
                        <Smile />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Singlespine?
            </h2>
            <p className="text-lg text-muted-foreground">
              Built with love for the African diaspora community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-card border border-border/40 rounded-xl p-6 text-center hover:shadow-lg transition-shadow hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {/* <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about sending gifts through Singlespine
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border/40 rounded-xl mb-4 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <h3 className="font-semibold text-foreground pr-4">
                    {faq.question}
                  </h3>
                  <div
                    className={cn(
                      'flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300',
                      expandedFaq === index ? 'rotate-45' : ''
                    )}
                  >
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                </button>
                <div
                  className={cn(
                    'transition-[max-height,padding] duration-500 ease-in-out overflow-hidden',
                    expandedFaq === index ? 'max-h-96' : 'max-h-0'
                  )}
                >
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Send Some Love?
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Join thousands of diaspora families who trust Singlespine to
              deliver their love across continents. Your family is waiting!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="font-semibold"
              >
                <Link href="/products">Browse Gifts</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-black/20 text-white hover:bg-white/10 hover:border-white font-semibold"
                asChild
              >
                <Link href="/auth/signup">Create Account</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Reliable Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>Made with Love</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
