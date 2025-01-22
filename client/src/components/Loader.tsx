import { MutatingDots } from "react-loader-spinner";
export const Loader = () => {
  return (
    <div className="w-full h-full bg-stone-200 flex justify-center items-center">
      <MutatingDots
        height="100"
        width="100"
        color="#0ea5e9" //bg-sky-500
        secondaryColor="#0ea5e9"
      />
    </div>
  );
};
