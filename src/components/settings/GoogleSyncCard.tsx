import { Globe } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

interface GoogleSyncCardProps {
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
}

export function GoogleSyncCard({ isConnected, onConnect, onDisconnect }: GoogleSyncCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm border-slate-100 overflow-hidden bg-white">
      <CardHeader className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold text-slate-800">Integrasi Google Contacts</CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-0.5">Sinkronisasi pendaftar langsung ke HP Anda</CardDescription>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConnected ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Google People API</p>
              <p className="text-xs text-slate-500">Otomatis tambah kontak saat pendaftaran sukses</p>
            </div>
          </div>
          {isConnected ? (
            <Button
              type="button"
              variant="outline"
              onClick={onDisconnect}
              className="w-full sm:w-auto rounded-xl"
            >
              Putuskan Koneksi
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onConnect}
              className="w-full sm:w-auto rounded-xl gap-2 h-auto py-2.5"
            >
              <Globe className="w-4 h-4" />
              Hubungkan ke Google
            </Button>
          )}
        </div>
        {!isConnected && (
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-[11px] text-amber-700 leading-relaxed">
              <strong>Penting:</strong> Fitur ini memerlukan izin akses ke kontak Google Anda untuk menambahkan nasabah baru secara otomatis. Kami tidak akan menghapus atau memodifikasi kontak yang sudah ada.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
