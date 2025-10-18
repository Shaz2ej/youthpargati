import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { RefreshCw, Edit } from 'lucide-react'
import { requestWithdrawal, updateStudentUpiId } from '@/lib/api.js'

function WithdrawalsCard({
  userId,
  availableBalance,
  withdrawals,
  onSuccessfulWithdrawal,
  formatCurrency,
  formatDate,
  getStatusBadge,
  studentData
}) {
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [upiId, setUpiId] = useState(studentData?.upi_id || '')
  const [showUpiModal, setShowUpiModal] = useState(false)
  const [editingUpi, setEditingUpi] = useState(false)
  const [withdrawalLoading, setWithdrawalLoading] = useState(false)
  const [upiLoading, setUpiLoading] = useState(false)

  const handleWithdrawalRequest = async (e) => {
    e.preventDefault()
    if (!withdrawalAmount || withdrawalAmount <= 0) return

    setWithdrawalLoading(true)
    try {
      // Validate minimum amount
      const amount = parseFloat(withdrawalAmount)
      if (amount < 200) {
        throw new Error("Minimum withdrawal amount is ₹200")
      }

      // Request withdrawal with UPI ID
      const result = await requestWithdrawal(userId, amount, upiId)
      if (result.error) throw new Error(result.error)

      setWithdrawalAmount('')
      onSuccessfulWithdrawal() // Refresh data
    } catch (err) {
      console.error('Withdrawal error:', err)
      alert(err.message || 'Failed to process withdrawal request')
    } finally {
      setWithdrawalLoading(false)
    }
  }

  const handleUpiSave = async (e) => {
    e.preventDefault()
    if (!upiId) return

    setUpiLoading(true)
    try {
      const result = await updateStudentUpiId(userId, upiId)
      if (result.error) throw new Error(result.error)

      setShowUpiModal(false)
      setEditingUpi(false)
      onSuccessfulWithdrawal() // Refresh data
    } catch (err) {
      console.error('UPI update error:', err)
      alert(err.message || 'Failed to save UPI ID')
    } finally {
      setUpiLoading(false)
    }
  }

  const handleUpiEdit = () => {
    setEditingUpi(true)
    setShowUpiModal(true)
  }

  const handleAddUpi = () => {
    setEditingUpi(false)
    setShowUpiModal(true)
  }

  return (
    <>
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-blue-600">Withdraw Funds</h2>
          {(studentData?.upi_id || showUpiModal) && (
            <Button variant="outline" size="sm" onClick={studentData?.upi_id ? handleUpiEdit : handleAddUpi}>
              <Edit className="h-4 w-4 mr-2" />
              {studentData?.upi_id ? 'Edit UPI ID' : 'Add UPI ID'}
            </Button>
          )}
        </div>
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
            <CardDescription>Request withdrawals from your earnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
              <p className="text-3xl font-black text-green-600">{formatCurrency(availableBalance)}</p>
              <p className="text-gray-600">Available for withdrawal</p>
            </div>

            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div>
                <Label htmlFor="withdrawal-amount">Withdrawal Amount (Min ₹200)</Label>
                <Input
                  id="withdrawal-amount"
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="200"
                  max={availableBalance}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={withdrawalLoading || !withdrawalAmount || parseFloat(withdrawalAmount) < 200}
              >
                {withdrawalLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Request Withdrawal'
                )}
              </Button>
            </form>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Withdrawal History</h3>
              </div>
              <div className="space-y-2">
                {withdrawals.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No withdrawals yet</p>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{formatCurrency(withdrawal.amount)}</p>
                          <p className="text-sm text-gray-600">{formatDate(withdrawal.created_at)}</p>
                        </div>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      {withdrawal.bank_details?.upi_id && (
                        <p className="text-xs text-gray-500 mt-1">UPI: {withdrawal.bank_details.upi_id}</p>
                      )}
                      {withdrawal.admin_notes && (
                        <p className="text-xs text-gray-500 mt-1">Note: {withdrawal.admin_notes}</p>
                      )}
                      {withdrawal.processed_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Processed: {formatDate(withdrawal.processed_date)}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* UPI ID Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingUpi || studentData?.upi_id ? 'Edit UPI ID' : 'Add UPI ID'} </CardTitle>
              <CardDescription>
                {editingUpi || studentData?.upi_id
                  ? 'Update your UPI ID for withdrawals' 
                  : 'Please enter your UPI ID to proceed with withdrawal'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpiSave} className="space-y-4">
                <div>
                  <Label htmlFor="upi-id">UPI ID</Label>
                  <Input
                    id="upi-id"
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="example@upi"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be used for all future withdrawals
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowUpiModal(false)
                      setEditingUpi(false)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={upiLoading || !upiId}
                  >
                    {upiLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export { WithdrawalsCard }