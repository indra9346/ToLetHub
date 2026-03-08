import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Edit2, Trash2, Home, Eye, EyeOff, Loader2, IndianRupee,
  MapPin, LayoutDashboard, LogOut, Bed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useMyHouses, useCreateHouse, useUpdateHouse, useDeleteHouse, type House } from "@/hooks/useHouses";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const emptyForm = {
  title: "",
  address: "",
  description: "",
  rent: "",
  rooms: "1",
  bathrooms: "1",
  has_hall: false,
  has_kitchen: true,
  area: "",
  lat: "12.9716",
  lng: "77.5946",
  amenities: "",
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  status: "vacant" as const,
};

const AdminDashboard = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: myHouses, isLoading } = useMyHouses(user?.id);
  const createHouse = useCreateHouse();
  const updateHouse = useUpdateHouse();
  const deleteHouse = useDeleteHouse();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <LayoutDashboard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">Admin Access Required</h3>
          <p className="text-muted-foreground mb-6">You need admin privileges to access the dashboard.</p>
          <Button onClick={() => navigate("/listings")}>Browse Listings</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload images
    const imageUrls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("house-images").upload(path, file);
      if (error) {
        toast.error("Failed to upload image: " + error.message);
        return;
      }
      const { data: urlData } = supabase.storage.from("house-images").getPublicUrl(path);
      imageUrls.push(urlData.publicUrl);
    }

    const houseData = {
      title: form.title,
      address: form.address,
      description: form.description || null,
      rent: parseFloat(form.rent),
      rooms: parseInt(form.rooms),
      bathrooms: parseInt(form.bathrooms),
      has_hall: form.has_hall,
      has_kitchen: form.has_kitchen,
      area: form.area ? parseFloat(form.area) : null,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      amenities: form.amenities ? form.amenities.split(",").map((a) => a.trim()) : [],
      contact_name: form.contact_name,
      contact_phone: form.contact_phone,
      contact_email: form.contact_email || null,
      status: form.status,
      owner_id: user.id,
      images: imageUrls.length > 0 ? imageUrls : undefined,
    };

    try {
      if (editingId) {
        await updateHouse.mutateAsync({ id: editingId, ...houseData });
        toast.success("House updated!");
      } else {
        await createHouse.mutateAsync(houseData as any);
        toast.success("House added!");
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      setImageFiles([]);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEdit = (house: House) => {
    setForm({
      title: house.title,
      address: house.address,
      description: house.description || "",
      rent: String(house.rent),
      rooms: String(house.rooms),
      bathrooms: String(house.bathrooms),
      has_hall: house.has_hall,
      has_kitchen: house.has_kitchen,
      area: house.area ? String(house.area) : "",
      lat: String(house.lat),
      lng: String(house.lng),
      amenities: house.amenities?.join(", ") || "",
      contact_name: house.contact_name,
      contact_phone: house.contact_phone,
      contact_email: house.contact_email || "",
      status: house.status as "vacant" | "occupied",
    });
    setEditingId(house.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteHouse.mutateAsync(id);
      toast.success("Listing deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async (house: House) => {
    const newStatus = house.status === "vacant" ? "occupied" : "vacant";
    try {
      await updateHouse.mutateAsync({ id: house.id, status: newStatus });
      toast.success(`Marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground">{myHouses?.length ?? 0} properties listed</p>
          </motion.div>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingId(null); setForm(emptyForm); setImageFiles([]); } }}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> Add House</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display">{editingId ? "Edit House" : "Add New House"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Title *</label>
                      <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Modern 2BHK Apartment" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Rent (₹/month) *</label>
                      <Input type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} required placeholder="15000" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Address *</label>
                    <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required placeholder="123 MG Road, Bangalore" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the property..." rows={3} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Rooms</label>
                      <Select value={form.rooms} onValueChange={(v) => setForm({ ...form, rooms: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Bathrooms</label>
                      <Select value={form.bathrooms} onValueChange={(v) => setForm({ ...form, bathrooms: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Area (sq.ft)</label>
                      <Input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="1000" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Status</label>
                      <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vacant">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={form.has_hall} onCheckedChange={(c) => setForm({ ...form, has_hall: c })} /> Hall
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={form.has_kitchen} onCheckedChange={(c) => setForm({ ...form, has_kitchen: c })} /> Kitchen
                    </label>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Latitude *</label>
                      <Input type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Longitude *</label>
                      <Input type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Amenities (comma-separated)</label>
                    <Input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Parking, Lift, Security, Gym" />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Contact Name *</label>
                      <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Phone *</label>
                      <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                      <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                    </div>
                  </div>
                  {!editingId && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">House Images</label>
                      <Input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))} />
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={createHouse.isPending || updateHouse.isPending}>
                    {(createHouse.isPending || updateHouse.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editingId ? "Update House" : "Add House"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => { signOut(); navigate("/"); }} className="gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : myHouses && myHouses.length > 0 ? (
          <div className="space-y-4">
            {myHouses.map((house, i) => (
              <motion.div
                key={house.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-4 card-shadow flex flex-col sm:flex-row gap-4"
              >
                <img
                  src={house.images?.[0] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"}
                  alt={house.title}
                  className="w-full sm:w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-semibold text-card-foreground truncate">{house.title}</h3>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <MapPin className="w-3 h-3" /> {house.address}
                      </div>
                    </div>
                    <Badge className={house.status === "vacant" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                      {house.status === "vacant" ? "Available" : "Rented"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      <IndianRupee className="w-3 h-3" />{Number(house.rent).toLocaleString("en-IN")}/mo
                    </span>
                    <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {house.rooms}R</span>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(house)} className="gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(house)} className="gap-1">
                    {house.status === "vacant" ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {house.status === "vacant" ? "Mark Rented" : "Mark Vacant"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(house.id)} className="gap-1 text-destructive hover:text-destructive">
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-6">Click "Add House" to create your first listing.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
