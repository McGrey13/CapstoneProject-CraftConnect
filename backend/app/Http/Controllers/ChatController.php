<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Messages;
use App\Events\MessageSent;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function sendMessage(Request $request, $conversationId)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $message = Messages::create([
            'conversation_id' => $conversationId,
            'sender_id' => auth()->id(),
            'message' => $request->message,
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message);
    }

    public function getMessages($conversationId)
    {
        return Messages::where('conversation_id', $conversationId)
                      ->with('conversation')
                      ->get();
    }
}
