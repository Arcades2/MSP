import { type User } from "@prisma/client";
import Image from "next/image";

type AvatarProps = {
  user: User;
};

const Avatar = ({ user }: AvatarProps) => (
  <div className="flex items-center">
    <div className="relative h-10 w-10 overflow-hidden rounded-full">
      {user.image ? (
        <Image src={user.image} alt={user.name} fill />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-teal-950">
          <span>{user.name[0]?.toUpperCase() ?? "?"}</span>
        </div>
      )}
    </div>
    <div className="ml-2">
      <p className="font-bold">{user.name}</p>
    </div>
  </div>
);

export default Avatar;
