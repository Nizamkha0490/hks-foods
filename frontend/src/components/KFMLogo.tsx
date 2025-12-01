

export const KFMLogo = () => {
  return (
    <div className="p-6 border-b border-kf-border">
      <div className="flex items-center gap-3">
        <img
          src="/logoupdt.png"
          alt="HKS Foods Logo"
          className="w-10 h-10 rounded-lg object-contain"
        />
        <div>
          <h1 className="text-lg font-bold text-metallic">
            HKS Foods
          </h1>
          <p className="text-xs text-kf-text-mid">Warehouse Management</p>
        </div>
      </div>
    </div>
  );
};
