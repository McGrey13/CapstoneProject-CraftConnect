<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    public function sendMessage(Request $request, $conversationId)
    {
        $request->validate([
            'message_text' => 'nullable|string',
            'message_type' => 'nullable|in:custom_request,order_update,damage_report,after_sale,general',
            'receiver_id' => 'required|exists:users,userID',
            'attachments.*.file_url' => 'required|string',
            'attachments.*.file_type' => 'required|in:image,document,other',
        ]);

        DB::beginTransaction();

        try {
            $message = Message::create([
                'conversation_id' => $conversationId,
                'sender_id' => auth()->id(),
                'receiver_id' => $request->receiver_id,
                'message_text' => $request->message_text,
                'message_type' => $request->message_type ?? 'general',
            ]);

            if ($request->has('attachments')) {
                foreach ($request->attachments as $attachment) {
                    MessageAttachment::create([
                        'message_id' => $message->message_id,
                        'file_url' => $attachment['file_url'],
                        'file_type' => $attachment['file_type'],
                    ]);
                }
            }

            DB::commit();

            broadcast(new MessageSent($message))->toOthers();

            return response()->json($message->load('attachments'));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Message failed to send.'], 500);
        }
    }

    public function getMessages($conversationId)
    {
        return Message::where('conversation_id', $conversationId)
                      ->with(['conversation', 'attachments'])
                      ->orderBy('created_at', 'asc')
                      ->get();
    }
}
