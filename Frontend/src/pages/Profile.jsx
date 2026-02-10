import React, { useState } from "react";
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

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(
    "https://github.com/shadcn.png"
  );

  const user = {
    name: "Asmat Bangash",
    email: "asmat@example.com",
    role: "Full Stack Developer",
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: user,
  });

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue("avatar", file); // store file in form
    setPreview(URL.createObjectURL(file)); // preview
  };

  const onSubmit = async (data) => {
    console.log("Updated Profile:", data);
    // data.avatar -> image file
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-muted p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={preview} />
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <CardTitle className="text-xl">Profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your personal information
            </p>
          </div>

          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="mt-6">
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{user.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{user.role}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="space-y-2">
                <Label>Profile Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Role</Label>
                <Input {...register("role")} />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
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
