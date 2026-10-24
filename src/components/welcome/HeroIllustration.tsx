import Image from "next/image";

export function HeroIllustration() {
  return (
    <div className="welcome-fade-delay relative mx-auto w-full max-w-md lg:max-w-lg">
      <Image
        src="/girl_photo.png"
        alt="Student with a book in front of a campus"
        width={840}
        height={720}
        priority
        className="h-auto w-full object-contain"
      />
    </div>
  );
}
