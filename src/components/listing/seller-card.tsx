import { Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Seller } from "@/lib/types";
import { SELLER_TYPES } from "@/mock/taxonomy";

export function SellerCard({ seller }: { seller: Seller }) {
  return (
    <div className='rounded-lg border border-border bg-card p-5 flex items-center justify-between gap-4'>
      <div className='flex min-w-0 items-center gap-3'>
        <Avatar className='h-12 w-12'>
          <AvatarImage src={seller.avatar} alt={seller.name} />
          <AvatarFallback>{seller.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className='min-w-0'>
          <p className='truncate font-medium'>{seller.name}</p>
          <p className='mt-0.5 text-[13px] text-muted-foreground'>
            {SELLER_TYPES[seller.type]}
          </p>
        </div>
      </div>

      <Button variant='accent' size='lg' className='shrink-0 gap-2' asChild>
        <a href={`tel:${seller.phone}`}>
          <Phone className='h-4 w-4' />
          {seller.phone}
        </a>
      </Button>
    </div>
  );
}
