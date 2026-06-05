import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useListProducts } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart, Send, CheckCircle } from "lucide-react";
import { Link } from "wouter";

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-serif font-bold mb-2">Message Sent!</h3>
        <p className="text-muted-foreground mb-6">Thank you for reaching out. We'll get back to you shortly.</p>
        <Button variant="outline" onClick={() => setStatus("idle")}>Send Another</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
            <Input placeholder="Richard Anin" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address <span className="text-destructive">*</span></label>
            <Input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone Number <span className="text-muted-foreground text-xs">(optional)</span></label>
          <Input type="tel" placeholder="+233 XX XXX XXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Message <span className="text-destructive">*</span></label>
          <Textarea placeholder="How can we help you?" rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required className="resize-none" />
        </div>
        {status === "error" && (
          <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
          {status === "sending" ? (
            <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending...</span>
          ) : (
            <span className="flex items-center gap-2"><Send className="h-4 w-4" />Send Message</span>
          )}
        </Button>
      </form>
    </div>
  );
}

export default function Home() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const { data: allProducts } = useListProducts();
  const { addToCart, cartCount } = useCart();

  const featuredProducts = (allProducts ?? []).filter((p) => p.featured === "true");
  const featuredFootwear = featuredProducts.filter((p) => p.category !== "Accessories").slice(0, 3);
  const featuredAccessories = featuredProducts.filter((p) => p.category === "Accessories").slice(0, 3);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Napong Ahenema King" className="h-10 w-10 object-contain" />
            <span className="font-serif text-2xl font-bold text-primary">Napong Ahenema King</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <button onClick={() => scrollTo("home")} className="text-sm font-medium hover:text-primary transition-colors">Home</button>
            <button onClick={() => scrollTo("products")} className="text-sm font-medium hover:text-primary transition-colors">Products</button>
            <button onClick={() => scrollTo("portfolio")} className="text-sm font-medium hover:text-primary transition-colors">Portfolio</button>
            <button onClick={() => scrollTo("blog")} className="text-sm font-medium hover:text-primary transition-colors">Blog</button>
            <button onClick={() => scrollTo("about")} className="text-sm font-medium hover:text-primary transition-colors">About</button>
            <button onClick={() => scrollTo("contact")} className="text-sm font-medium hover:text-primary transition-colors">Contact</button>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{cartCount}</span>
                )}
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="default" size="sm" className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground">Shop Now</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* 2. Hero */}
        <section id="home" className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://user-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_clip,w_960,h_720,f_auto,q_auto/unsplashcom/photo-1669843081536-68f8f10cf86d"
              alt="Ghanaian rich kente background"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
                Step into <span className="text-primary italic">Quality</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
                Explore Our Exquisite Collection of Ghanaian Footwear and Traditional Wear
              </motion.p>

              <motion.div variants={fadeInUp} className="bg-card p-6 rounded-2xl shadow-xl border border-border/50 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground mb-4 font-medium">Find your perfect pair</p>
                <div className="flex gap-3">
                  <Input placeholder="Search footwear..." className="flex-1 h-11" />
                  <Link href="/shop">
                    <Button size="lg" className="h-11 px-6">Search</Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 3. Quote Band */}
        <section className="py-16 bg-muted/50 border-t border-b border-border/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Our Heritage</h2>
              <div className="w-16 h-1 bg-primary mx-auto mb-8"></div>
              <p className="text-xl md:text-2xl leading-relaxed font-medium">
                "We deal with quality African Ghanaian footwear and quality traditional wear, quality queen and king's ornaments, and quality customer services."
              </p>
            </motion.div>
          </div>
        </section>

        {/* 4. Featured Products — live from DB */}
        <section id="products" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">Featured Products</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Discover our handcrafted selections that celebrate authentic Ghanaian artistry.</p>
            </div>

            {featuredFootwear.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No featured products yet. Mark products as featured in the admin panel.</p>
            )}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {featuredFootwear.map((product) => (
                <motion.div key={product.id} variants={fadeInUp} className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border/40">
                  <div className="relative h-80 overflow-hidden">
                    {product.status === "coming_soon" && (
                      <Badge className="absolute top-4 right-4 z-10 bg-primary/90 hover:bg-primary">Coming Soon</Badge>
                    )}
                    {product.status === "preorder" && (
                      <Badge className="absolute top-4 right-4 z-10 bg-secondary/90 hover:bg-secondary">Pre-Order</Badge>
                    )}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-serif font-bold">{product.name}</h3>
                      <span className="font-semibold text-primary">GH₵{Number(product.price).toFixed(2)}</span>
                    </div>
                    {product.options && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {product.options.split(",").map((opt, i) => (
                          <Badge key={i} variant="secondary" className="bg-muted text-muted-foreground text-xs">{opt.trim()}</Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description}</p>
                    {product.status === "available" ? (
                      <Button className="w-full" onClick={() => addToCart({ productId: product.id, productName: product.name, unitPrice: Number(product.price), imageUrl: product.imageUrl, quantity: 1 })}>
                        Add to Cart
                      </Button>
                    ) : product.status === "preorder" ? (
                      <Button variant="outline" className="w-full">Pre-Order Now</Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>Coming Soon</Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-12">
              <Link href="/shop">
                <Button variant="outline" size="lg" className="px-8">View All Products</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Portfolio / Accessories — live from DB */}
        <section id="portfolio" className="py-24 bg-muted/30 border-t border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">Royal Accessories</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Embrace your sovereignty with our meticulously crafted royal ornaments.</p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {(featuredAccessories.length > 0 ? featuredAccessories : (allProducts ?? []).filter(p => p.category === "Accessories").slice(0, 3)).map((product) => (
                <motion.div key={product.id} variants={fadeInUp} className="relative group overflow-hidden rounded-2xl aspect-square">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                    <h3 className="text-2xl font-serif font-bold mb-2">{product.name}</h3>
                    <p className="text-sm text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0 transform">{product.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 6. Customer Testimonials */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-16">Voices of Our Community</h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                { name: "Kwame Mensah", role: "Accra, Ghana", text: "The Ahenema I purchased are of exceptional quality. The craftsmanship reminds me of what my grandfather used to wear. Authentic, sturdy, and profoundly beautiful." },
                { name: "Akosua Osei", role: "Kumasi, Ghana", text: "I bought the beaded slippers for a traditional wedding and received countless compliments. They are incredibly comfortable and the beadwork is so meticulously done." },
                { name: "Abena Serwaa", role: "London, UK", text: "Ordering international was seamless. The gold-plated ornaments I received made me feel like royalty on my special day. True Ghanaian excellence delivered globally." }
              ].map((testimonial, i) => (
                <motion.div key={i} variants={fadeInUp} className="bg-card p-8 rounded-2xl shadow-sm border border-border/40 relative">
                  <div className="text-primary text-4xl font-serif absolute top-4 left-6 opacity-20">"</div>
                  <p className="text-muted-foreground italic mb-6 relative z-10 pt-4">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-serif font-bold text-xl">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 7. About Us */}
        <section id="about" className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-8">About Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                <motion.div variants={fadeInUp} className="space-y-6">
                  <h3 className="text-2xl font-serif font-semibold text-primary">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    At Napong Ahenema King, our mission is to bring the rich cultural heritage of Ghana to the world through meticulously crafted footwear, traditional wear, and royal ornaments. We believe in preserving the authenticity of our ancestors' designs while providing modern comfort.
                  </p>
                </motion.div>
                <motion.div variants={fadeInUp} className="space-y-6">
                  <h3 className="text-2xl font-serif font-semibold text-primary">Our Commitment</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We are dedicated to dealing strictly in quality African Ghanaian footwear, high-grade traditional wear, and authentic queen and king's ornaments. Above all, we pride ourselves on delivering excellent customer service that treats every client like royalty.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 8. Blog */}
        <section id="blog" className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">Insights, Trends, and Style Tips</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Subscribe to Our Newsletter for the Latest Updates</p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                { title: "How to Clean Your Footwear", date: "May 13, 2026", tag: "Product Care Tips", img: "https://user-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_clip,w_960,h_720,f_auto,q_auto/unsplashcom/photo-1611620004902-492806387f6d" },
                { title: "Accessorizing with Purpose: The Power of Ornaments", date: "May 13, 2026", tag: "Style Guides", img: "https://user-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_clip,w_960,h_720,f_auto,q_auto/unsplashcom/photo-1656327159129-7c35c0d7069d" },
                { title: "Footwear Fundamentals: Choosing the Right Pair", date: "May 13, 2026", tag: "Style Guides", img: "https://user-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_clip,w_960,h_720,f_auto,q_auto/unsplashcom/photo-1626076042972-1682128c50b0" }
              ].map((post, i) => (
                <motion.div key={i} variants={fadeInUp} className="group cursor-pointer">
                  <div className="overflow-hidden rounded-2xl mb-4 aspect-[4/3]">
                    <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className="text-xs text-primary border-primary/30">{post.tag}</Badge>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold group-hover:text-primary transition-colors">{post.title}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 9. Contact Us */}
        <section id="contact" className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Have a question or need help? Send us a message and we'll get back to you as soon as possible.</p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain brightness-0 invert opacity-70" />
              <span className="font-serif text-3xl font-bold text-primary">Napong Ahenema King</span>
            </div>
            <p className="text-background/70 max-w-sm mb-6 leading-relaxed">
              We deal with quality African Ghanaian footwear, traditional wear, queen and king's ornaments, and excellent customer service.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-lg tracking-wide uppercase text-background/90">Quick Links</h4>
            <ul className="flex flex-col gap-4 text-background/70">
              <li><button onClick={() => scrollTo("home")} className="hover:text-primary transition-colors text-sm">Home</button></li>
              <li><button onClick={() => scrollTo("products")} className="hover:text-primary transition-colors text-sm">Products</button></li>
              <li><button onClick={() => scrollTo("portfolio")} className="hover:text-primary transition-colors text-sm">Portfolio</button></li>
              <li><Link href="/track" className="hover:text-primary transition-colors text-sm">Track Order</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-lg tracking-wide uppercase text-background/90">More Info</h4>
            <ul className="flex flex-col gap-4 text-background/70">
              <li><button onClick={() => scrollTo("blog")} className="hover:text-primary transition-colors text-sm">Blog</button></li>
              <li><button onClick={() => scrollTo("about")} className="hover:text-primary transition-colors text-sm">About Us</button></li>
              <li><button onClick={() => scrollTo("contact")} className="hover:text-primary transition-colors text-sm">Contact</button></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4">
          <Separator className="bg-background/10 mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-background/50">
            <p>&copy; 2026 Napong Ahenema King. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Crafted with pride in Ghana</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
