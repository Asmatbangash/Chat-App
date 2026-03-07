import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { MoveLeft } from "lucide-react";

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);
  const { user, setUser } = useAuth();
  
  // Initialize preview with user's profile picture
  useEffect(() => {
    if (user?.profilePic) {
      setPreview(user.profilePic);
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      FullName: user?.FullName || "",
      bio: user?.bio || "",
      profilePic: null,
    },
  });

  // Update form values when user data loads
  useEffect(() => {
    if (user) {
      reset({
        FullName: user.FullName || "",
        bio: user.bio || "",
        profilePic: null,
      });
      if (user.profilePic) {
        setPreview(user.profilePic);
      }
    }
  }, [user, reset]);

  // Handle image change with compression
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    // Compress and convert image to base64
    compressImage(file);
  };

  // Compress image before uploading
  const compressImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if image is too large (max 1080px)
        const MAX_SIZE = 1080;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = (height / width) * MAX_SIZE;
            width = MAX_SIZE;
          } else {
            width = (width / height) * MAX_SIZE;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed base64 (JPEG with 0.7 quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setValue('profilePic', compressedBase64);
        setPreview(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    try {
      const updateData = {
        FullName: data.FullName,
        bio: data.bio,
      };

      // Only include profilePic if it was changed
      if (data.profilePic) {
        updateData.profilePic = data.profilePic;
      }

      const response = await api.post("/user/update-profile", updateData, {
        headers: {
          'Content-Type': 'application/json',
        },
        maxBodyLength: 10 * 1024 * 1024, // 10MB limit
      });
      
      if (response.data.success) {
        // Update the user context with new data
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setIsEditing(false);
        
        // Show success message (you can replace with a toast notification)
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-muted/50 p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-2xl border-muted">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="-ml-2 gap-2 hover:bg-muted/50"
            >
              <MoveLeft className="h-4 w-4" /> Back
            </Button>
            
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)}
                className="gap-2"
                size="sm"
              >
                Edit Profile
              </Button>
            )}
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={preview || "https://github.com/shadcn.png"} />
                <AvatarFallback className="text-2xl">
                  {user?.FullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Label htmlFor="avatar-upload" className="cursor-pointer text-white text-sm font-medium">
                    Change
                  </Label>
                </div>
              )}
            </div>
            
            <div className="text-center space-y-1">
              <CardTitle className="text-2xl font-bold">
                {user?.FullName || "User"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="mt-6">
          {!isEditing ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Full Name</p>
                </div>
                <div>
                  <p className="font-medium text-lg">{user?.FullName || "Not set"}</p>
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Email</p>
                </div>
                <div>
                  <p className="font-medium text-lg">{user?.email || "Not set"}</p>
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] gap-4 items-start">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Bio</p>
                </div>
                <div>
                  <p className="font-medium">{user?.bio || "No bio added"}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">Profile Image</Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {preview && (
                  <div className="mt-3 flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={preview} />
                      <AvatarFallback>Preview</AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground">New image preview</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Full Name</Label>
                <Input
                  {...register("FullName", { required: "Name is required" })}
                  placeholder="Enter your full name"
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
                {errors.FullName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span>⚠️</span> {errors.FullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Bio</Label>
                <Input
                  {...register("bio")}
                  placeholder="Tell us about yourself..."
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">Brief description for your profile</p>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span> Saving...
                    </>
                  ) : (
                    <>
                      <span>💾</span> Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    reset({
                      FullName: user?.FullName || "",
                      bio: user?.bio || "",
                      profilePic: null,
                    });
                    if (user?.profilePic) {
                      setPreview(user.profilePic);
                    }
                  }}
                  className="flex-1"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
